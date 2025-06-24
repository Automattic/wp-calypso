import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import DomainSuggestion from 'calypso/components/domains/domain-suggestion';
import './style.scss';

class DomainSkipSuggestion extends Component {
	static propTypes = {
		onButtonClick: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;
		const buttonContent = translate( 'Skip Purchase' );

		return (
			<DomainSuggestion
				buttonContent={ buttonContent }
				buttonStyles={ { borderless: true } }
				extraClasses="is-visible domain-skip-suggestion"
				hidePrice
				onButtonClick={ this.props.onButtonClick }
				showChevron={ false }
				ariaLabel={ buttonContent }
				// tracksButtonClickSource={ this.props.tracksButtonClickSource }
			>
				<div className="domain-skip-suggestion__domain-description">
					<h3>{ this.props.selectedSiteSlug }</h3>
					<p>
						{ translate( 'This is your current free site address.', {
							comment:
								"Explains that the domain name shown above this sentence is this site's currently active domain, and it is free of cost.",
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
}

export default localize( DomainSkipSuggestion );
