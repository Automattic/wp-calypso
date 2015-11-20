Geocoding
=========

Geocoding is a helper library for working with the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro). The geocoding API is used to convert addresses to geographic coordinates.

## Usage

Geocoding exports a single function, `geocode`. The function accepts a single `address` argument and returns a Promise instance. The promise resolver should expect to receive an array of [geocoding results](https://developers.google.com/maps/documentation/geocoding/intro#Results), or an error if the request could not be made.

```jsx
import { geocode } from 'lib/geocoding';

geocode( '1600 Amphitheatre Parkway, Mountain View, CA' )
	.then( ( results ) => console.log( results ) )
	.catch( ( error ) => console.error( error ) );
```
