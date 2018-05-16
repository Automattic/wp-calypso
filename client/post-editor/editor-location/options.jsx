/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import Popover from 'components/popover';
import PostMetadata from 'lib/post-metadata';
import { updatePostMetadata } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';

function statusToBoolean( status ) {
	return 'public' === status;
}

class EditorLocationOptions extends React.Component {
	static propTypes = {
		isSharedPublicly: PropTypes.string,
		addressDescription: PropTypes.string,
	};

	state = {
		open: false,
		renderContext: null,
	};

	onShareChange = event => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_public: event.target.checked ? 1 : 0,
		} );
	};

	onDescriptionChange = event => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_address: event.target.value,
		} );
	};

	open = () => {
		this.setState( {
			open: true,
		} );
	};

	toggle = () => {
		this.setState( {
			open: ! this.state.open,
		} );
	};

	setRenderContext = renderContext => {
		if ( ! renderContext ) {
			return;
		}

		this.setState( { renderContext } );
	};

	render() {
		return (
			<div className="editor-location__options">
				<Button borderless compact onClick={ this.toggle } ref={ this.setRenderContext }>
					<Gridicon icon="ellipsis-circle" /> { this.props.translate( 'Display options' ) }
				</Button>
				<Popover
					isVisible={ this.state.open }
					context={ this.state.renderContext }
					closeOnEsc={ true }
					rootClassName="editor-location__options-popover"
				>
					<div className="editor-location__option-fields">
						<div className="editor-location__option-field">
							<label htmlFor="geo_address">
								Description
								<FormTextInput
									name="geo_address"
									id="geo_address"
									value={ this.props.addressDescription }
									onChange={ this.onDescriptionChange }
								/>
							</label>
						</div>
						<div className="editor-location__option-field">
							<label htmlFor="geo_public">
								<FormCheckbox
									id="geo_public"
									name="geo_public"
									checked={ statusToBoolean( this.props.isSharedPublicly ) }
									onChange={ this.onShareChange }
								/>
								<span>{ this.props.translate( 'Display location publicly' ) }</span>
							</label>
						</div>
					</div>
				</Popover>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const isSharedPublicly = PostMetadata.geoIsSharedPublicly( post );
		const addressDescription = PostMetadata.geoAddressDescription( post );

		return { siteId, postId, isSharedPublicly, addressDescription };
	},
	{
		updatePostMetadata,
	}
)( localize( EditorLocationOptions ) );
