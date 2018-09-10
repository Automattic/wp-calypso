/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import GridiconCheckmarkCircle from 'gridicons/dist/checkmark-circle';

/**
 * Internal dependencies
 */
import AddButton from './add-button';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';

class Content extends React.PureComponent {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<section className="privacy-protection-card__content">
				<div className="privacy-protection-card__description">
					<h2>{ translate( 'Why use Privacy Protection?' ) }</h2>

					<p>
						{ translate(
							"With Privacy Protection, we show our partner's contact information instead of your own."
						) }
						<a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer">
							{ translate( 'Learn more.' ) }
						</a>
					</p>
				</div>
				<div className="privacy-protection-card__features">
					<h5>
						<GridiconCheckmarkCircle size={ 18 } />
						{ translate( '{{strong}}Protects{{/strong}} Your Identity Online', {
							components: {
								strong: <strong />,
							},
						} ) }
					</h5>

					<h5>
						<GridiconCheckmarkCircle size={ 18 } />
						{ translate( '{{strong}}Reduces{{/strong}} Email Spam', {
							components: {
								strong: <strong />,
							},
						} ) }
					</h5>

					<h5>
						<GridiconCheckmarkCircle size={ 18 } />
						{ translate( '{{strong}}Helps{{/strong}} Prevent Domain Hacking', {
							components: {
								strong: <strong />,
							},
						} ) }
					</h5>
				</div>

				<AddButton
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
				/>
			</section>
		);
	}
}

export default localize( Content );
