/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AddButton from './add-button';
import QueryProductsList from 'components/data/query-products-list';
import { getProductDisplayCost } from 'state/products-list/selectors';

const Header = React.createClass( {
	propTypes: {
		displayCost: React.PropTypes.string,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		const { displayCost } = this.props;

		if ( ! displayCost ) {
			return <QueryProductsList />;
		}

		return (
			<header className="privacy-protection-card__header">
				<h3>{ this.translate( 'Privacy Protection' ) }</h3>

				<div className="privacy-protection-card__price">
					<h4 className="privacy-protection-card__price-per-user">
						{ this.translate( '{{strong}}%(cost)s{{/strong}} per domain / year', {
							args: {
								cost: displayCost
							},
							components: {
								strong: <strong />
							}
						} ) }
					</h4>
				</div>

				<AddButton
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite } />
			</header>
		);
	}
} );

export default connect(
	state => ( {
		displayCost: getProductDisplayCost( state, 'private_whois' ),
	} )
)( Header );
