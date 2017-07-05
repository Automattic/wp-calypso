/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { requestTags } from 'state/reader/tags/items/actions';
import { getReaderFollowedTags, getReaderTags } from 'state/selectors';

/**
 * @param {Boolean} tags - if true then will hand over all tags currently in redux. Will also request for followed tags if empty
 * @param {Boolean} followedTags - if true will hand over 'followedTags' prop to its children.  Will request for followedTags if empty
 * @param {undefined|Object} tag - must be of the form: { slug }.  Will request a specific tag and hand the key 'tag' to its child.
 *
 * @returns {Need} the need for a reader tag
 */
const readerTags = ( { tags = false, followedTags = false, tag = undefined } ) => ( {
	mapStateToProps: ( state, ownProps ) => {
		const props = {};

		if ( tag ) {
			const slug = ownProps[ tag.slug ];
			props.tag = find( getReaderTags( state ), { slug } );
		}
		if ( tags ) {
			props.tags = getReaderTags( state );
		}
		if ( followedTags ) {
			props.followedTags = getReaderFollowedTags( state );
		}

		return props;
	},

	mapStateToRequestActions: ( state, ownProps ) => {
		const requestActions = [];
		const tagsShouldBeFetched = ( followedTags || tags ) && getReaderTags( state ) === null;
		const tagShouldBeFetched =
			tag &&
			ownProps[ tag.slug ] &&
			! find( getReaderTags( state ), { slug: ownProps[ tag.slug ] } );

		tagsShouldBeFetched && requestActions.push( requestTags() );
		tagShouldBeFetched && requestActions.push( requestTags( ownProps[ tag.slug ] ) );

		return requestActions;
	},
} );

export default readerTags;
