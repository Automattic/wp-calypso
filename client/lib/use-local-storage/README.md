# useLocalStorage hook

A hook that works just like `useState()`, except the value is saved
to `.localStorage`.

State is serialized to JSON so that it can accept any data type. Versioning of
state is left as an exercise for the consumer.

## Motivation

A typical way to take advantage of `.localStorage` in Calypso has been to save
data to the Redux store, and then mark that it should be persisted. This is a
fairly heavy-weight solution for a React component that just wants to save a
simple user preference between page refreshes.

If you're looking to cache server responses in `.localStorage` you might want to
look at a solution based on `react-query` instead.
