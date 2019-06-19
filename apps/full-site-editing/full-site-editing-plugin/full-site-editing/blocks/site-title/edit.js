/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withNotices } from '@wordpress/components';
import { PlainText } from '@wordpress/editor';
import apiFetch from '@wordpress/api-fetch';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { Component, Fragment } from '@wordpress/element';

class SiteTitleEdit extends Component {
	state = {
		title: __( 'Site title loading…' ),
		initialTitle: '',
	};

	componentDidMount() {
		const { noticeOperations } = this.props;

		return apiFetch( { path: '/wp/v2/settings' } )
			.then( ( { title } ) => this.setState( { initialTitle: title, title } ) )
			.catch( ( { message } ) => noticeOperations.createErrorNotice( message ) );
	}

	componentDidUpdate( prevProps ) {
		const { title, initialTitle } = this.state;
		const { shouldUpdateSiteOption, noticeOperations, isSelected } = this.props;

		const titleUnchanged = title && title.trim() === initialTitle.trim();
		const titleIsEmpty = ! title || title.trim().length === 0;

		// Reset to initial value if user de-selects the block with an empty value.
		if ( ! isSelected && prevProps.isSelected && titleIsEmpty ) {
			this.revertTitle();
		}

		// Don't do anything further if we shouldn't update the site option or the value is unchanged.
		if ( ! shouldUpdateSiteOption || titleUnchanged ) {
			return;
		}

		if ( ! prevProps.shouldUpdateSiteOption && shouldUpdateSiteOption ) {
			apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { title } } )
				.then( () => this.updateInitialTitle() )
				.catch( ( { message } ) => {
					noticeOperations.createErrorNotice( message );
					this.revertTitle();
				} );
		}
	}

	revertTitle = () => this.setState( { title: this.state.initialTitle } );

	updateInitialTitle = () => this.setState( { initialTitle: this.state.title } );

	render() {
		const { title } = this.state;
		const { className, noticeUI } = this.props;

		return (
			<Fragment>
				{ noticeUI }
				<PlainText
					className={ classNames( 'site-title', className ) }
					value={ title }
					onChange={ value => this.setState( { title: value } ) }
					placeholder={ __( 'Site Title' ) }
					aria-label={ __( 'Site Title' ) }
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
] )( SiteTitleEdit );
