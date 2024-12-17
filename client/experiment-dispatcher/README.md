# Experiment URL Dispatcher

This tool splits incoming traffic into multiple branches, redirecting users to different URLs based on defined ExPlat experiments.

## Adding an Experiment

Follow these steps to add a new experiment:

1. **Define the Experiment**:  
   Add your experiment in the `experiment.ts` file. Each experiment requires a unique `slug` (object key).  
   - The `slug` determines the URL path. For example, if your slug is `help-center`, the dispatch URL will be:  
     ```
     /assign/help-center
     ```

2. **Add Variants**:  
   Specify variants for your experiment. When a variant is matched, users will be redirected to the URL defined for that variant. Each experiment must have at least two variants, one of which is called `control`. Otherwise, the unit tests will fail.

## How It Works

1. A user visits `/assign/SLUG`. The corresponding experiment manifest is loaded.
2. The experiment is loaded on the client-side, considering the user’s logged-in state.
3. A variant is determined based on the manifest in `experiment.ts`.
4. Once a variant is matched, the user is redirected to the `url` associated with that variant.

## Feedback

We’d love to hear from you!  
- Share your feedback in the `#vertex` channel.  
- Alternatively, visit: [vertexp2.wordpress.com](https://vertexp2.wordpress.com).
