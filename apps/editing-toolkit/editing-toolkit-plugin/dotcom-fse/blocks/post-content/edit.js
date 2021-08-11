/* eslint-disable wpcalypso/jsx-classname-namespace */

import { InnerBlocks } from '@wordpress/block-editor';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { PostTitle } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import classNames from 'classnames';

class PostContentEdit extends Component {
	toggleEditing() {
		const { isEditing, setState } = this.props;
		setState( { isEditing: ! isEditing } );
	}

	onSelectPost( { id, type } ) {
		this.props.setState( {
			isEditing: false,
			selectedPostId: id,
			selectedPostType: type,
		} );
	}

	render() {
		const { attributes } = this.props;
		const { align } = attributes;

		return (
			<Fragment>
				<div
					className={ classNames( 'post-content-block', {
						[ `align${ align }` ]: align,
					} ) }
				>
					<PostTitle />
					<InnerBlocks templateLock={ false } />
				</div>
			</Fragment>
		);
	}
}

export default compose( [
	withState( {
		isEditing: false,
		selectedPostId: undefined,
		selectedPostType: undefined,
	} ),
	withSelect( ( select, { selectedPostId, selectedPostType } ) => {
		const { getEntityRecord } = select( 'core' );
		return {
			selectedPost: getEntityRecord( 'postType', selectedPostType, selectedPostId ),
		};
	} ),
] )( PostContentEdit );
