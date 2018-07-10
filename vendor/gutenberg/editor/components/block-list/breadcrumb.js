/**
 * WordPress dependencies
 */
import { compose, Component, Fragment } from '@wordpress/element';
import { Toolbar } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockTitle from '../block-title';

/**
 * Block breadcrumb component, displaying the label of the block. If the block
 * descends from a root block, a button is displayed enabling the user to select
 * the root block.
 *
 * @param {string}   props.uid             UID of block.
 * @param {string}   props.rootUID         UID of block's root.
 * @param {Function} props.selectRootBlock Callback to select root block.
 */
export class BlockBreadcrumb extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isFocused: false,
		};
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );
	}

	onFocus( event ) {
		this.setState( {
			isFocused: true,
		} );

		// This is used for improved interoperability
		// with the block's `onFocus` handler which selects the block, thus conflicting
		// with the intention to select the root block.
		event.stopPropagation();
	}

	onBlur() {
		this.setState( {
			isFocused: false,
		} );
	}

	render( ) {
		const { uid, rootUID } = this.props;

		return (
			<div className={ 'editor-block-list__breadcrumb' }>
				<Toolbar>
					{ rootUID && (
						<Fragment>
							<BlockTitle uid={ rootUID } />
							<span className="editor-block-list__descendant-arrow" />
						</Fragment>
					) }
					<BlockTitle uid={ uid } />
				</Toolbar>
			</div>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const { getBlockRootUID } = select( 'core/editor' );
		const { uid } = ownProps;

		return {
			rootUID: getBlockRootUID( uid ),
		};
	} ),
] )( BlockBreadcrumb );
