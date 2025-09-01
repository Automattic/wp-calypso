# API Queries

A layer on top of `@automattic/api-core` to provide a more convenient way to fetch data from the WordPress.com REST API, using TanStack Query.

It exports a `queryClient` instance, which can be used by a React application to serve as its query client. This client includes sensible defaults for caching, error handling, and more.

## Queries and mutations

Each file represents a resource from `@automattic/api-core`, and exports a query or mutation builder, which accepts the same arguments as the corresponding function from `@automattic/api-core`.

## Contributing

To add a new resource, create a new file in the `src` directory and follow the same pattern as the other files in the directory.
