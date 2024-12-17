### Experiment URL Dispatcher

On landing, this splits traffic into two or more branches. Each pointing to their own URLs.

### Adding an experiment

1. Add your experiment in `experiment.ts` file. Make sure to give your experiment a unique `slug` (object key). The slug will be the second part of the pathname. If your slug is "help-center". The dispatching URL will be /assign/help-center.
2. Add variants to your experiment. When a variant is matched, the user will be redirect to URL of that variant.

### How it works

1. When a user visits /assign/SLUG, the dispatching config file SLUG.json is loaded.
2. The user is then redirected to the URLS specified in the JSON file.
