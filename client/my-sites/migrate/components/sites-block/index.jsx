import { getUrlParts } from '@automattic/calypso-url';
import { Badge, FormLabel, Gridicon, Spinner } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Site from 'calypso/blocks/site';
import FormTextInput from 'calypso/components/forms/form-text-input';
import './style.scss';

class SitesBlock extends Component {
	state = {};

	onSubmit = ( event ) => {
		event.preventDefault();

		this.props?.onSubmit?.( event );

		return false;
	};

	renderFauxSiteSelector() {
		const { onUrlChange, translate, url } = this.props;
		const { error } = this.state;
		const isError = !! error;

		return (
			<div className="sites-block__faux-site-selector">
				<div className="sites-block__faux-site-selector-content">
					<div className="sites-block__faux-site-selector-icon">
						{ this.props.loadingSourceSite && <Spinner /> }
					</div>
					<div className="sites-block__faux-site-selector-info">
						<form onSubmit={ this.onSubmit }>
							<FormLabel
								className="sites-block__faux-site-selector-label"
								htmlFor="sites-block__faux-site-selector-url-input"
							>
								{ translate( 'Import from…' ) }
							</FormLabel>
							<div className="sites-block__faux-site-selector-url">
								<FormTextInput
									autoFocus // eslint-disable-line jsx-a11y/no-autofocus
									isError={ isError }
									onChange={ onUrlChange }
									value={ url }
									placeholder="example.com"
									id="sites-block__faux-site-selector-url-input"
									name="sites-block__faux-site-selector-url-input"
								/>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}

	getSourceSiteOrInput = () => {
		const { sourceSite, sourceSiteInfo } = this.props;

		if ( ! sourceSite && ! sourceSiteInfo ) {
			return this.renderFauxSiteSelector();
		}

		const site = sourceSite || this.convertSourceSiteInfoToSourceSite( sourceSiteInfo );

		return <Site site={ site } indicator={ false } />;
	};

	convertSourceSiteInfoToSourceSite = ( sourceSiteInfo ) => {
		const { hostname } = getUrlParts( sourceSiteInfo.site_url );
		return {
			icon: { img: sourceSiteInfo.site_favicon },
			title: sourceSiteInfo.site_title,
			domain: hostname,
		};
	};

	render() {
		const { targetSite, step, translate } = this.props;
		const isSourceSelectStep = step === 'sourceSelect';
		const className = clsx( 'sites-block__sites', {
			'is-step-source-select': isSourceSelectStep,
		} );

		return (
			<div className={ className }>
				<div className="sites-block__source-site">{ this.getSourceSiteOrInput() }</div>
				<div className="sites-block__sites-arrow-wrapper">
					<Gridicon className="sites-block__sites-arrow" icon="arrow-right" />
				</div>
				<div className="sites-block__target-site">
					<Site site={ targetSite } indicator={ false } />
					<div className="sites-block__sites-labels-container">
						<Badge type="info">{ translate( 'This Site' ) }</Badge>
					</div>
				</div>
			</div>
		);
	}
}

SitesBlock.propTypes = {
	sourceSiteInfo: PropTypes.object,
	sourceSite: PropTypes.object,
	loadingSourceSite: PropTypes.bool,
	targetSite: PropTypes.object.isRequired,
	onUrlChange: PropTypes.func,
	onSubmit: PropTypes.func,
	step: PropTypes.string,
};

export default localize( SitesBlock );
