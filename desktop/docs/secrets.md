# Secrets

Some secrets are needed to build the app. You will need to create the files yourself.

## Calypso Secrets

We use an OAuth connection to authenticate logins against the WordPress.com API. 
You can [create an application here](https://developer.wordpress.com/apps/). 

When creating your application, provide a name and a quick description. In the `Javascript Origins` field, you'll
want to whitelist `http://127.0.0.1:41050`. Leave the application type as `web`. Answer the bot challenge, 
and click on the create button. The other fields may be left blank.

In the end, your application details should look similar to:
![application details](https://cldup.com/Juw-5uEHlR.png)

After your application is created, copy your client id and client secret, and either add or update `/config/secrets.json` file and be sure to include the following properties:

```json
{
	...
	"desktop_oauth_token_endpoint": "https://public-api.wordpress.com/oauth2/token",
	"desktop_oauth_client_id": "<YOUR CLIENT ID>",
	"desktop_oauth_client_secret": "<YOUR CLIENT SECRET>"
}
```
