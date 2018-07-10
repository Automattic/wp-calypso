# **core**: WordPress Core Data

## Selectors 

### getTerms

Returns all the available terms for the given taxonomy.

*Parameters*

 * state: Data state.
 * taxonomy: Taxonomy name.

### getCategories

Returns all the available categories.

*Parameters*

 * state: Data state.

*Returns*

Categories list.

### isRequestingTerms

Returns true if a request is in progress for terms data of a given taxonomy,
or false otherwise.

*Parameters*

 * state: Data state.
 * taxonomy: Taxonomy name.

*Returns*

Whether a request is in progress for taxonomy's terms.

### isRequestingCategories

Returns true if a request is in progress for categories data, or false
otherwise.

*Parameters*

 * state: Data state.

*Returns*

Whether a request is in progress for categories.

### getAuthors

Returns all available authors.

*Parameters*

 * state: Data state.

*Returns*

Authors list.

### getEntitiesByKind

Returns whether the entities for the give kind are loaded.

*Parameters*

 * state: Data state.
 * kind: Entity kind.

*Returns*

Whether the entities are loaded

### getEntity

Returns the entity object given its kind and name.

*Parameters*

 * state: Data state.
 * kind: Entity kind.
 * name: Entity name.

*Returns*

Entity

### getEntityRecord

Returns the Entity's record object by key.

*Parameters*

 * state: State tree
 * kind: Entity kind.
 * name: Entity name.
 * key: Record's key

*Returns*

Record.

### getThemeSupports

Return theme supports data in the index.

*Parameters*

 * state: Data state.

*Returns*

Index data.

## Actions

### receiveTerms

Returns an action object used in signalling that terms have been received
for a given taxonomy.

*Parameters*

 * taxonomy: Taxonomy name.
 * terms: Terms received.

### receiveUserQuery

Returns an action object used in signalling that authors have been received.

*Parameters*

 * queryID: Query ID.
 * users: Users received.

### addEntities

Returns an action object used in adding new entities.

*Parameters*

 * entities: Entities received.

### receiveEntityRecords

Returns an action object used in signalling that entity records have been received.

*Parameters*

 * kind: Kind of the received entity.
 * name: Name of the received entity.
 * records: Records received.

### receiveThemeSupportsFromIndex

Returns an action object used in signalling that the index has been received.

*Parameters*

 * index: Index received.