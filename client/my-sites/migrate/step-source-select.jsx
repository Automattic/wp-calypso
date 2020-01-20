/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { Button, CompactCard } from '@automattic/components';
import page from 'page';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Site from 'blocks/site';
import wpLib from 'lib/wp';

/**
 * Style dependencies
 */
import './section-migrate.scss';

const wpcom = wpLib.undocumented();

class StepSourceSelect extends Component {
	static propTypes = {
		onSiteInfoReceived: PropTypes.func.isRequired,
		onUrlChange: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		error: null,
		isLoading: false,
	};

	handleContinue = () => {
		if ( this.state.isLoading ) {
			return;
		}

		this.setState( { error: null, isLoading: true }, () => {
			wpcom
				.isSiteImportable( this.props.url )
				.then( result => {
					const importUrl = `/import/${ this.props.targetSiteSlug }?not-wp=1&engine=${ result.site_engine }&from-site=${ result.site_url }`;

					switch ( result.site_engine ) {
						case 'wordpress':
							return this.props.onSiteInfoReceived( result, () => {
								page( `/migrate/choose/${ this.props.targetSiteSlug }` );
							} );
						default:
							if ( window && window.history && window.history.pushState ) {
								/**
								 * Because query parameters aren't processed by `page.show`, we're forced to use `page.redirect`.
								 * Unfortunately, `page.redirect` breaks the back button behavior.
								 * This is a Work-around to push importUrl to history to fix the back button.
								 * See https://github.com/visionmedia/page.js#readme
								 */
								window.history.pushState( null, null, importUrl );
							}
							return page.redirect( importUrl );
					}
				} )
				.catch( error => {
					switch ( error.code ) {
						case 'rest_invalid_param':
							return this.setState( {
								error: "We couldn't reach that site. Please check the URL and try again.",
								loading: false,
							} );
						default:
							return this.setState( {
								error: 'Something went wrong. Please check the URL and try again.',
								loading: false,
							} );
					}
				} );
		} );
	};

	renderFauxSiteSelector() {
		const { onUrlChange, url } = this.props;
		const { error } = this.state;
		const isError = !! error;

		return (
			<div className="migrate__faux-site-selector">
				<div className="migrate__faux-site-selector-content">
					<div className="migrate__faux-site-selector-icon"></div>
					<div className="migrate__faux-site-selector-info">
						<div className="migrate__faux-site-selector-label">Import from...</div>
						<div className="migrate__faux-site-selector-url">
							<FormTextInput isError={ isError } onChange={ onUrlChange } value={ url } />
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { targetSite, targetSiteSlug } = this.props;
		const backHref = `/import/${ targetSiteSlug }`;
		const uploadHref = `/import/${ targetSiteSlug }?engine=wordpress`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Import from WordPress</HeaderCake>
				<CompactCard>
					<CardHeading>What WordPress site do you want to import?</CardHeading>
					<div className="migrate__explain">
						Enter a URL and we'll help you move your site to WordPress.com. If you already have a
						backup file, you can <a href={ uploadHref }>upload it to import content</a>.
					</div>
				</CompactCard>
				<CompactCard className="migrate__sites">
					{ this.renderFauxSiteSelector() }
					<Gridicon className="migrate__sites-arrow" icon="arrow-right" />
					<Site site={ targetSite } indicator={ false } />
				</CompactCard>
				<CompactCard>
					<Button busy={ this.state.isLoading } onClick={ this.handleContinue } primary={ true }>
						Continue
					</Button>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepSourceSelect );
