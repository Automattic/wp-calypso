# Redux Cleanup

How to remove Redux state, actions, reducers, selectors, and `connect()` HOCs after a read-query migration. Mutations follow a similar but simpler path — see [mutations.md](mutations.md) section 5.

## Cleanup checklist (per migrated REQUEST action)

Run after the migration commit is passing:

1. Remove the REQUEST action type from `client/state/reader/action-types.ts`
2. Remove the request action creator from `client/state/reader/{domain}/actions.ts` (e.g., `requestSubscribedLists`)
3. Remove the data-layer handler from `client/state/data-layer/wpcom/read/{domain}/index.js` — **only the specific handler block for the REQUEST action being migrated**
4. Remove the `isRequesting` reducer from `client/state/reader/{domain}/reducer.js` and from the `combineReducers()` call
5. Update selectors that referenced the removed state (e.g., `isRequestingXxx`)
6. Remove related tests for deleted actions, reducers, and selectors

**Be careful:** the data-layer file may contain handlers for other actions (FOLLOW, UNFOLLOW, UPDATE, etc.) that are NOT being migrated. Surgical removal only.

## Handling `isRequesting*` selectors

**Do NOT simply delete selectors that check request/loading state.** Components may use them for spinners, disabled buttons, or conditional rendering.

### Step 1: Find all consumers

```bash
grep -r "isRequestingXxx" client/ --include="*.{ts,tsx,js,jsx}" -l
```

### Step 2: Replace Redux request state with React Query state

```typescript
// Before
const isLoading = useSelector( isRequestingXxx );

// After
const { isLoading } = useQuery( readXxxQuery() );
```

**React Query loading states:**
- `isLoading` — first load, no cached data yet (matches old `isRequesting` on first mount)
- `isFetching` — any fetch including background refetch (use for subtle indicators)
- `isPending` — no data yet (query disabled or first load)

## Migrating `connect()` HOC

### Function components: replace `connect()` with hooks

`mapStateToProps` data selectors → `useSelector()` calls.
`mapStateToProps` request state (`isRequesting*`) → destructured `useQuery()` state.
`mapDispatchToProps` request actions (`requestXxx`) → **removed entirely** (React Query handles fetching).
`mapDispatchToProps` non-request actions → `useDispatch()` + direct dispatch.
The `connect()` HOC is removed.

```typescript
// Before
export default connect(
  ( state ) => ( {
    items: getItems( state ),
    isLoading: state.reader.xxx.isRequestingXxx,
  } ),
  { requestXxx }
)( MyComponent );

// After
export default function MyComponent( { someParam }: Props ) {
  const { data, isLoading } = useQuery( readXxxQuery( someParam ) );
  const items = useSelector( getItems );

  if ( isLoading ) return <Spinner />;
  return <ItemList items={ items } />;
}
```

### Class components: bridge React Query via a small HOC

Hooks **cannot** run inside class components. **Do not rewrite class components to function components** as part of a data migration — that's a separate refactor.

Instead, wrap the class with a functional HOC that calls `useQuery()` and forwards the result as props.

```typescript
// Old: class reads isRequesting from Redux
class MyClassComponent extends Component {
  render() {
    if ( this.props.isLoading ) return <Spinner />;
    return <ItemList items={ this.props.items } />;
  }
}

export default connect( ( state ) => ( {
  items: getItems( state ),
  isLoading: state.reader.xxx.isRequestingXxx,
} ) )( MyClassComponent );
```

```typescript
// New: functional wrapper bridges React Query into props
function MyClassComponentWithQuery( props ) {
  const { isLoading } = useQuery( readXxxQuery() );
  return <MyClassComponent { ...props } isLoading={ isLoading } />;
}

// connect() still maps Redux data; no longer maps isLoading
export default connect( ( state ) => ( {
  items: getItems( state ),
} ) )( MyClassComponentWithQuery );
```

### Decision tree

- **Function component + `connect()`** → convert to hooks, remove HOC entirely.
- **Class component + `connect()`** → add a functional wrapper for the query, keep `connect()` for Redux data.
- **Class component is the only consumer of the slice** → consider a HOC that replaces `connect()` AND the bridge entirely (see "Evaluate removing the data-component" in `SKILL.md`).
