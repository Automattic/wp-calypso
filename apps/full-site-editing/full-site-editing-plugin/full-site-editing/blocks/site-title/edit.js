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
		this.requestSiteTitle();
	}

	componentDidUpdate( prevProps ) {
		const { title, initialTitle } = this.state;
		const {
			isSaving,
			isPublished,
			isPublishing,
			isAutosaving,
			noticeOperations,
			isSelected,
		} = this.props;

		const titleUnchanged = title && title.trim() === initialTitle.trim();
		const titleIsEmpty = ! title || title.trim().length === 0;

		// Reset to initial title if user de-selects the block with an empty value
		if ( ! isSelected && prevProps.isSelected && titleIsEmpty ) {
			this.setSiteTitle( initialTitle );
		}

		// Don't do anything further if the title is unchanged or the saving state is the same as previous update
		if ( titleUnchanged || prevProps.isSaving === this.props.isSaving ) {
			return;
		}

		const userInitiatedPublish = ( ( isSaving && isPublished ) || isPublishing ) && ! isAutosaving;

		// Save the title on publish
		if ( userInitiatedPublish ) {
			apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { title } } )
				.then( () => this.resetTitle() )
				.catch( ( { message } ) => noticeOperations.createErrorNotice( message ) );
		}
	}

	requestSiteTitle = () => {
		const { noticeOperations } = this.props;

		return apiFetch( { path: '/wp/v2/settings' } )
			.then( ( { title } ) => this.setState( { initialTitle: title, title } ) )
			.catch( ( { message } ) => noticeOperations.createErrorNotice( message ) );
	};

	setSiteTitle = value => this.setState( { title: value } );

	resetTitle = () => this.setState( { initalTitle: this.state.title } );

	render() {
		const { title } = this.state;
		const { className, noticeUI } = this.props;

		return (
			<Fragment>
				{ noticeUI }
				<h1>
					<PlainText
						className={ classNames( 'site-title', className ) }
						value={ title }
						onChange={ this.setSiteTitle }
						placeholder={ __( 'Site Title' ) }
						aria-label={ __( 'Site Title' ) }
					/>
				</h1>
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
			isSaving: isSavingPost(),
			isPublishing: isPublishingPost(),
			isAutosaving: isAutosavingPost(),
			isPublished: isCurrentPostPublished(),
		};
	} ),
	withNotices,
] )( SiteTitleEdit );
