# People

The components in this folder handle the `/people` section of calypso. 'People' refers to users, followers,
viewers, and invites.

index.js provides all the routes for this section. controller.js decides which component to render, and main.js
is the main component used for rendering the different lists in this section.

## People List

main.js handles rendering of a list of people. The rendered list depends on the chosen filter in PeopleSectionNav. For example,
the `people/team` route will render a TeamList component.

Every list will be a collection of PeopleListItem components.

## Data

Each list fetches it's list items from the API using slightly different methods.
By default, the data is managed via a data component ( `client/components/data` ).
For example, the FollowersList gets data from `client/components/data/followers-data`.

The TeamList is an exception. It's data is retrieved via `client/components/sites-user-fetcher`.
