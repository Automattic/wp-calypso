/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AddButton from './add-button';

const Header = React.createClass({
    propTypes: {
        products: React.PropTypes.object.isRequired,
        selectedDomainName: React.PropTypes.string.isRequired,
        selectedSite: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.bool,
        ]).isRequired,
    },

    render() {
        const displayCost = this.props.products &&
            this.props.products.private_whois &&
            this.props.products.private_whois.cost_display;

        if (!displayCost) {
            return null;
        }

        return (
            <header className="privacy-protection-card__header">
                <h3>{this.translate('Privacy Protection')}</h3>

                <div className="privacy-protection-card__price">
                    <h4 className="privacy-protection-card__price-per-user">
                        {this.translate('{{strong}}%(cost)s{{/strong}} per domain / year', {
                            args: {
                                cost: displayCost,
                            },
                            components: {
                                strong: <strong />,
                            },
                        })}
                    </h4>
                </div>

                <AddButton
                    selectedDomainName={this.props.selectedDomainName}
                    selectedSite={this.props.selectedSite}
                />
            </header>
        );
    },
});

export default Header;
