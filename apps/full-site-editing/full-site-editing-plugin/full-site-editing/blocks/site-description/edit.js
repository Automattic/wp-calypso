/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { PlainText } from '@wordpress/block-editor';
import { withNotices } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class SiteDescriptionEdit extends Component {
	state = {
		description: __( 'Site description loading…' ),
		initialDescription: '',
	};

	componentDidMount() {
		const { noticeOperations } = this.props;

		return apiFetch( { path: '/wp/v2/settings' } )
			.then( ( { description } ) =>
				this.setState( { initialDescription: description, description } )
			)
			.catch( ( { message } ) => {
				noticeOperations.createErrorNotice( message );
			} );
	}

	componentDidUpdate( prevProps ) {
		const { description, initialDescription } = this.state;
		const { shouldUpdateSiteOption, noticeOperations, isSelected } = this.props;

		const descriptionUnchanged = description && description.trim() === initialDescription.trim();
		const descriptionIsEmpty = ! description || description.trim().length === 0;

		// Reset to initial value if user de-selects the block with an empty value.
		if ( ! isSelected && prevProps.isSelected && descriptionIsEmpty ) {
			this.revertDescription();
		}

		// Don't do anything further if we shouldn't update the site option or the value is unchanged.
		if ( ! shouldUpdateSiteOption || descriptionUnchanged ) {
			return;
		}

		if ( ! prevProps.shouldUpdateSiteOption && shouldUpdateSiteOption ) {
			apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { description } } )
				.then( () => this.updateInitialDescription() )
				.catch( ( { message } ) => {
					noticeOperations.createErrorNotice( message );
					this.revertDescription();
				} );
		}
	}

	revertDescription = () => this.setState( { description: this.state.initialDescription } );

	updateInitialDescription = () => this.setState( { initialDescription: this.state.description } );

	render() {
		const { className, noticeUI } = this.props;
		const { description } = this.state;

		return (
			<Fragment>
				{ noticeUI }
				<PlainText
					className={ className }
					value={ description }
					onChange={ value => this.setState( { description: value } ) }
					placeholder={ __( 'Site Description' ) }
					aria-label={ __( 'Site Description' ) }
				/>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( select => {
		const { isSavingPost, isPublishingPost, isAutosavingPost, isCurrentPostPublished } = select(
			'core/editor'
		);
		return {
			shouldUpdateSiteOption:
				( ( isSavingPost() && isCurrentPostPublished() ) || isPublishingPost() ) &&
				! isAutosavingPost(),
		};
	} ),
	withNotices,
] )( SiteDescriptionEdit );
