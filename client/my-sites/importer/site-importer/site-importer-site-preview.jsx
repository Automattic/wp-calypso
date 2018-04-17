/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { map } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

class SiteImporterSitePreview extends React.Component {
	static propTypes = {
		siteURL: PropTypes.string.isRequired,
		importData: PropTypes.object,
		isLoading: PropTypes.bool,
	};
	render = () => {
		const containerClass = classNames( 'site-importer__site-preview-overlay-container', {
			isLoading: this.props.isLoading,
		} );

		return (
			<div className={ containerClass }>
				<div className="site-importer__site-preview-container">
					<div className="site-importer__site-preview-site-meta">
						<p>
							Is this your site?
							{ this.props.importData.favicon && (
								<img
									className="site-importer__site-preview-favicon"
									src={ this.props.importData.favicon }
									height="16px"
									width="16px"
									alt="Site favicon"
								/>
							) }
							<a
								className="site-importer__site-preview-siteurl"
								href={ this.props.siteURL }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ this.props.siteURL }
							</a>
						</p>
						<div>
							<p>Importing:</p>
							{ this.props.importData.supported &&
								this.props.importData.supported.length && (
									<ul>
										{ map( this.props.importData.supported, ( suppApp, idx ) => (
											<li key={ idx }>{ suppApp }</li>
										) ) }
										<li>Basic pages</li>
									</ul>
								) }
						</div>
					</div>
				</div>
				{ this.props.isLoading && (
					<div className="site-importer__site-preview-loading-overlay">
						<Spinner />
					</div>
				) }
			</div>
		);
	};
}

export default localize( SiteImporterSitePreview );
