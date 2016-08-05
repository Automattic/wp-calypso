/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';

export default React.createClass( {
	propTypes: {
		hosts: PropTypes.arrayOf(
			PropTypes.shape( {
				showHost: PropTypes.func.isRequired,
				label: PropTypes.string.isRequired,
				logo: PropTypes.string.isRequired
			} )
		).isRequired
	},

	render() {
		const { hosts } = this.props;

		return (
			<div>
				<SectionHeader label={ this.translate( 'Set up Guided Transfer' ) } />
				<Card>
					<p>{ this.translate(
'{{strong}}Please choose{{/strong}} one of our Guided Transfer compatible ' +
'{{partner_link}}partner hosts{{/partner_link}}. You must have a hosting account ' +
'with one of them to be able to move your site. Visit them {{lobby_link}}Guided ' +
'Transfer Lobby{{/lobby_link}} if you have any question before starting, or ' +
'{{learn_link}}learn more{{/learn_link}} about the process.',
						{
							components: {
								strong: <strong />,
								partner_link: <a href="https://get.wp.com/gt-hosting/" />,
								lobby_link: <a href="https://guidedtransfer.wordpress.com/" />,
								learn_link: <a href="https://en.support.wordpress.com/guided-transfer/" />,
							}
						} ) }
					</p>
					<div>
						{ hosts.map( ( host, index ) => {
							const { showHost, label, logo } = host;
							return (
								<Button
									className="guided-transfer__host-button"
									onClick={ showHost }
									key={ index }
									aria-label={ label } >
									<img className="guided-transfer__host-button-image" src={ logo } />
								</Button>
							);
						} ) }
					</div>
				</Card>
			</div>
		);
	}
} );
