import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';

class PartnerLogoGroup extends PureComponent {
	static displayName = 'JetpackPartnerLogoGroup';

	static propTypes = {
		partnerName: PropTypes.string,
		width: PropTypes.number,
		viewBox: PropTypes.string,
	};

	render() {
		const { width, viewBox, partnerName, translate } = this.props;

		return (
			<svg width={ width } viewBox={ viewBox }>
				<title>
					{
						// translators: partnerName is something like MilesWeb, WooCommerce or DreamHost
						translate( 'Co-branded Jetpack and %(partnerName)s logo', {
							args: {
								partnerName,
							},
						} )
					}
				</title>
				<g fill="none" fillRule="evenodd">
					<g>
						<g>
							<g transform="translate(219 35.082353)" className="jetpack-header__partner-logo-plus">
								<Gridicon icon="plus-small" size={ 72 } />
							</g>
							{ this.props.children }
							<JetpackLogo size={ 150 } />
						</g>
					</g>
				</g>
			</svg>
		);
	}
}

export default localize( PartnerLogoGroup );
