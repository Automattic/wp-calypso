/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { PlainText } from '@wordpress/block-editor';
import { withNotices, Button } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class SiteDescriptionEdit extends Component {
	state = {
		description: __( 'Site description loading…' ),
		initialDescription: '',
		isDirty: false,
		isSaving: false,
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
		const { shouldUpdateSiteOption, isSelected } = this.props;

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
			this.saveSiteDescription( description );
		}
	}

	onSave = () => {
		const { description, initialDescription } = this.state;
		const descriptionUnchanged = description && description.trim() === initialDescription.trim();

		if ( descriptionUnchanged ) {
			this.setState( { isDirty: false } );
			return;
		}
		this.saveSiteDescription( description );
	};

	saveSiteDescription( description ) {
		const { noticeOperations } = this.props;
		this.setState( { isSaving: true } );
		apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { description } } )
			.then( () => this.updateInitialDescription() )
			.catch( ( { message } ) => {
				noticeOperations.createErrorNotice( message );
				this.revertDescription();
			} );
	}

	revertDescription = () =>
		this.setState( {
			description: this.state.initialDescription,
			isSaving: false,
		} );

	updateInitialDescription = () => {
		this.setState( {
			initialDescription: this.state.description,
			isDirty: false,
			isSaving: false,
		} );
	};

	render() {
		const { className, noticeUI } = this.props;
		const { description, isDirty, isSaving } = this.state;

		return (
			<Fragment>
				{ noticeUI }
				<PlainText
					className={ className }
					value={ description }
					onChange={ value => this.setState( { description: value, isDirty: true } ) }
					placeholder={ __( 'Site Description' ) }
					aria-label={ __( 'Site Description' ) }
				/>
				{ isDirty && (
					<Button
						ref={ this.editButton }
						isLarge
						className="site-description__save-button"
						disabled={ isSaving }
						isBusy={ isSaving }
						onClick={ this.onSave }
					>
						{ __( 'Save' ) }
					</Button>
				) }
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
