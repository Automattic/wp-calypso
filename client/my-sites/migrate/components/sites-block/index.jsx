/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
/**
 * Internal dependencies
 */
import './style.scss';
import Site from 'blocks/site';
import Gridicon from 'components/gridicon';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import Badge from 'components/badge';
import { getUrlParts } from 'lib/url';

export default class SitesBlock extends Component {
	state = {};

	renderFauxSiteSelector() {
		const { onUrlChange, url } = this.props;
		const { error } = this.state;
		const isError = !! error;

		return (
			<div className="sites-block__faux-site-selector">
				<div className="sites-block__faux-site-selector-content">
					<div className="sites-block__faux-site-selector-icon" />
					<div className="sites-block__faux-site-selector-info">
						<FormLabel
							className="sites-block__faux-site-selector-label"
							htmlFor="sites-block__faux-site-selector-url-input"
						>
							Import from...
						</FormLabel>
						<div className="sites-block__faux-site-selector-url">
							<FormTextInput
								isError={ isError }
								onChange={ onUrlChange }
								value={ url }
								placeholder="example.com"
								id="sites-block__faux-site-selector-url-input"
								name="sites-block__faux-site-selector-url-input"
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	getSourceSiteOrInput = () => {
		const { sourceSite } = this.props;

		if ( ! sourceSite ) {
			return this.renderFauxSiteSelector();
		}

		return (
			<Site
				site={ this.convertSourceSiteObjectToSiteComponent( sourceSite ) }
				indicator={ false }
			/>
		);
	};

	convertSourceSiteObjectToSiteComponent = sourceSite => {
		const { hostname } = getUrlParts( sourceSite.site_url );
		return {
			icon: { img: sourceSite.site_favicon },
			title: sourceSite.site_title,
			domain: hostname,
		};
	};

	render() {
		const { targetSite } = this.props;
		return (
			<div className="sites-block__sites">
				<div className="sites-block__sites-item">{ this.getSourceSiteOrInput() }</div>
				<div className="sites-block__sites-arrow-wrapper">
					<Gridicon className="sites-block__sites-arrow" icon="arrow-right" />
				</div>
				<div className="sites-block__sites-item">
					<Site site={ targetSite } indicator={ false } />
					<div className="sites-block__sites-labels-container">
						<Badge type="info">This site</Badge>
					</div>
				</div>
			</div>
		);
	}
}

SitesBlock.propTypes = {
	sourceSite: PropTypes.object,
	loadingSourceSite: PropTypes.bool,
	targetSite: PropTypes.object.isRequired,
};
