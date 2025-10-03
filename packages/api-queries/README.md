# API Queries

A layer on top of `@automattic/api-core` to provide a more convenient way to fetch data from the WordPress.com REST API, using TanStack Query.

It exports a `queryClient` instance, which can be used by a React application to serve as its query client. This client includes sensible defaults for caching, error handling, and more.

## Queries and mutations

Each file represents a resource from `@automattic/api-core`, and exports a query or mutation builder, which accepts the same arguments as the corresponding function from `@automattic/api-core`.

## Contributing

These guidelines should be followed to ensure reusability of the queries and mutations across components.

### File structure

- Add related queries and mutations in the same file inside `src/`.
  - In most cases, you don't need to group these files into subdirectories.
- The filename should generally match the directory name of the corresponding resource in `@automattic/api-core`.
- If a file calls multiple `@automattic/api-core` endpoints, name it according to the feature rather than a single endpoint.
  - For example, the `site-backup-restore.ts` file calls endpoints under `/sites/${ siteId }/rewind` and `/activity-log/${ siteId }/rewind`.

### Adding queries

- Define queries as functions that return the result of `queryOptions()` from `@tanstack/react-query`. This is to improve TypeScript type inference.

- Avoid using the `select` option directly in the query definition, as it won't be applied when preloading via `queryClient.ensureQueryData()`. Instead:
  - If the query intends to return only a subset of the data, transform the result in the `queryFn`:

    ```ts
    export const isSiteUsingBlockThemeQuery = ( siteId: number ) => queryOptions( {
        queryFn: async () => {
            const themes = await siteActiveThemesQuery( siteId );
            return themes[ 0 ]?.is_block_theme ?? false;
        },
    } );
    ```

  - If a component only needs a subset of the data, pass `select` from the component:

    ```ts
    const { data } = useQuery( {
        ...sitePurchasesQuery( site.ID ),
        select: ( data ) => data.find( ( purchase ) => purchase.product_slug === WPCOM_DIFM_LITE ),
    } );
    ```

- Don't include query options that are specific to a single use case. Add them in the component instead.
  - For example, don't add an `enabled` option to to the query itself; the component should pass that instead:

    ```ts
    const { data } = useQuery( {
        ...siteWordPressVersionQuery( site.ID ),
        enabled: site.is_wpcom_staging_site,
    } );
    ```

- In general, avoid overriding query options unless absolutely necessary (e.g., `refetchOnMount`).
  - This prevents developers from copy-pasting options without understanding their purpose.

### Adding mutations

- Define mutations as functions that return the result of `mutationOptions()` from `@tanstack/react-query`. This is to improve TypeScript type inference.
- Add `onSuccess` and `onError` handlers to invalidate queries and update the cache as needed.
  - You can do so by using the exported `queryClient` instance:

    ```ts
    export const sitePHPVersionMutation = ( siteId: number ) =>
        mutationOptions( {
            /* other options */
            onSuccess: () => {
                queryClient.invalidateQueries( sitePHPVersionQuery( siteId ) );
            },
        } );
    ```

- Limit logic in `onSuccess` and `onError` handlers to query invalidation and cache updates.
  - Add additional logic (e.g., analytics or event tracking) in the component itself:

    ```ts
    const { mutate: updatePHPVersion } = useMutation( sitePHPVersionMutation( site.ID ) );
    updatePHPVersion( data, {
        onSuccess: () => {
            recordTracksEvent( 'calypso_settings_updated' );
        },
    } );
    ```

### Typings

TanStack Query's types are very fancy. The downside is they can be hard to get write when written by hand. That is why TanStack Query provides the `queryOptions` and `mutationOptions` utility functions as described above. At runtime these functions are a no-op. But by you using them your editor will give you code completion and TypeScript will be able to confirm they are well formed.

Callback functions like `onSuccess` and `select` in particular are tricky when you have to provide your own parameter types. These utility functions define the types for you. For example, we don't need to provide the type for `data` in `select` because it is inferred from the query function's return type:

    ```ts
    const { data } = useQuery( {
        ...sitePurchasesQuery( site.ID ),

        // No need to specify type for data below.
        select: ( data ) => data.find( ( purchase ) => purchase.product_slug === WPCOM_DIFM_LITE ),
    } );
    ```

In fact, we shouldn't specify the type here as it's very error-prone. Instead, we should specify it in the `@automattic/api-core` functions themselves, and by doing so we get type safety for free when using the queries in the components.
