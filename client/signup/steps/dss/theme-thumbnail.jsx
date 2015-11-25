/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import SignupActions from 'lib/signup/actions';
import Screenshot from './screenshot';
import DSSImageStore from 'lib/dss/image-store';

export default React.createClass( {
	displayName: 'DssThemeThumbnail',

	propTypes: {
		themeName: React.PropTypes.string.isRequired,
		themeSlug: React.PropTypes.string.isRequired,
		themeRepoSlug: React.PropTypes.string.isRequired
	},

	handleSubmit() {
		const { lastKey, imageResultsByKey } = DSSImageStore.get();
		const dssImage = imageResultsByKey[ lastKey ] ? imageResultsByKey[ lastKey ] : undefined;

		analytics.tracks.recordEvent( 'calypso_dss_select_theme', {
			theme: this.props.themeRepoSlug,
			search_term: lastKey
		} );

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, null, {
			theme: this.props.themeRepoSlug,
			images: dssImage ? [ dssImage ] : undefined
		} );

		this.props.goToNextStep();
	},

	getThumbnailUrl() {
		return 'https://i1.wp.com/s0.wp.com/wp-content/themes/' + this.props.themeRepoSlug + '/screenshot.png?w=660';
	},

	render() {
		return (
			<div onClick={ this.handleSubmit } className={ 'dss-theme-thumbnail__theme ' + this.props.themeSlug }>
				<Screenshot
					themeSlug={ this.props.themeSlug }
					themeRepoSlug={ this.props.themeRepoSlug }
					screenshotUrl={ this.getThumbnailUrl() }
					isLoading={ this.props.isLoading }
					dssImage={ this.props.dssImage }
					markupAndStyles={ this.props.markupAndStyles }
					renderComplete={ this.props.renderComplete }
				/>
				<span className="dss-theme-thumbnail__name">{ this.props.themeName }</span>
			</div>
		);
	}
} );
