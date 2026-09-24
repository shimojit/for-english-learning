# 英語学習サイト 開発環境

HTML・CSS・htmxを中心としたフロントエンドと、Hono / TypeScriptのAPIです。Reactは単語カードの部分だけに使用します。microCMSのAPIキーはバックエンドだけが保持します。

## Dockerで起動

Docker DesktopをLinuxコンテナモードで起動し、`web/for-english-learning`ディレクトリで実行します。バックエンドは`../../api`にあります。

```powershell
docker compose up --build
```

- サイト: http://localhost:5173
- APIの稼働確認: http://localhost:8787/api/health
- 教材JSON: http://localhost:8787/api/lessons
- htmx用HTML: http://localhost:8787/api/fragments/lessons

キーがなくてもサンプル教材で起動します。初回はイメージとnpm依存関係のダウンロードが必要です。ソースはマウントされ、編集が反映されます。依存関係はコンテナ専用ボリュームに置き、起動時の`npm ci`でlockfileと同期します。終了は`docker compose down`です。

## microCMSを接続

```powershell
Copy-Item ../../api/.dev.vars.example ../../api/.dev.vars
```

`../../api/.dev.vars`を編集します（Git管理対象外）。設定済みの場合はコピーせず既存ファイルを使用してください。

```dotenv
MICROCMS_SERVICE_DOMAIN=your-service
MICROCMS_API_KEY=your-read-only-api-key
MICROCMS_ENDPOINT=lessons
```

`MICROCMS_SERVICE_DOMAIN`はURL全体ではなく`your-service.microcms.io`の`your-service`部分です。microCMSでリスト形式のAPI `lessons`を作成し、以下のフィールドを追加します。

| フィールドID | 種類 | 必須 |
| --- | --- | --- |
| title | テキストフィールド | はい |
| description | テキストエリア | いいえ |

教材を公開し、このAPIのGET権限を持つキーを使用してください。現在は最新の最大20件を取得します。本文はプレーンテキストとしてエスケープして表示します。設定変更後は`docker compose restart api`を実行してください。ドメインとキーが両方空ならデモ、片方だけ設定されている場合や接続失敗の場合はエラーを返します。

## Cloudflare本番構成

Dockerコンテナはローカル開発用です。本番ではフロントをWorkers Static Assets、APIをHonoのWorkerとしてデプロイします。フロントWorkerは`/api/*`をService BindingでAPI Workerへ転送します。API Workerの公開workers.dev URLは無効にしています。同一オリジンで利用でき、ブラウザにmicroCMSキーを渡しません。

Node.js 22.12以上とCloudflareアカウントを用意し、まずAPIをデプロイします。

```powershell
cd ../../api
npm ci
npx wrangler login
npx wrangler secret put MICROCMS_SERVICE_DOMAIN
npx wrangler secret put MICROCMS_API_KEY
npm run deploy
```

初回のsecret設定でWorkerの作成確認が出た場合は作成してください。エンドポイント名を変える場合はAPIディレクトリの`wrangler.jsonc`の`MICROCMS_ENDPOINT`も変更してください。次にフロントをデプロイします。

```powershell
cd ../web/for-english-learning
npm ci
npm run deploy
```

フロントのデプロイ時に表示されるURLでアクセスできます。Worker名を変更する場合はフロントの`wrangler.jsonc`にある`services[].service`もAPIの名前と一致させてください。ローカルの`.dev.vars`は本番にアップロードされません。Cloudflare上へのデプロイはまだ実行していません。

## Dockerを使わない開発と確認

APIとフロントの各ディレクトリで`npm ci`後、それぞれ別ターミナルで`npm run dev`を起動します。フロントのViteが`/api`をlocalhost:8787へ転送します。

```powershell
# api 内
npm run check
npm test
npm run build

# web/for-english-learning 内
npm run build
npx wrangler deploy --dry-run
```

本番同様のService Bindingをローカルで確認する場合は、APIの`npm run dev`を起動したままフロントで`npm run preview`を実行し、http://localhost:8788 を開きます。

構成の参考: [Hono / Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)、[Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/binding/)、[Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)、[microCMS一覧取得API](https://document.microcms.io/en/content-api/get-list-contents)。
