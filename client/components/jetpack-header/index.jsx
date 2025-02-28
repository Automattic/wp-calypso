import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackPartnerLogoGroup from './partner-logo-group';

import './style.scss';

export class JetpackHeader extends PureComponent {
	static displayName = 'JetpackHeader';

	static propTypes = {
		darkColorScheme: PropTypes.bool,
		partnerSlug: PropTypes.string,
		isFromAutomatticForAgenciesPlugin: PropTypes.bool,
		isWooJPC: PropTypes.bool,
		isWooDna: PropTypes.bool,
		width: PropTypes.number,
	};

	renderLogo() {
		const {
			darkColorScheme,
			partnerSlug,
			width,
			isFromAutomatticForAgenciesPlugin,
			isWooJPC,
			isWooDna,
			translate,
		} = this.props;

		if ( isWooJPC ) {
			return null;
		}

		if ( isWooDna ) {
			return (
				<svg width={ width } viewBox="0 0 1270 170">
					<title>{ translate( 'WooCommerce logo' ) }</title>
					<g fill="none" fillRule="evenodd">
						<g transform="translate(125 25)">
							<AsyncLoad
								require="calypso/components/jetpack-header/woocommerce"
								darkColorScheme={ darkColorScheme }
								placeholder={ null }
							/>
						</g>
					</g>
				</svg>
			);
		}

		if ( isFromAutomatticForAgenciesPlugin ) {
			return (
				<svg
					width="282"
					height="58"
					viewBox="0 0 282 58"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clipPath="url(#clip0_6816_1592)">
						<path
							d="M107.202 19.4164C100.972 19.4164 96.9319 14.8051 96.9319 10.0056V9.41077C96.9319 4.52998 100.972 0 107.202 0C113.431 0 117.506 4.52998 117.506 9.41077V10.0056C117.506 14.8051 113.465 19.4164 107.202 19.4164ZM114.174 9.46162C114.174 5.96372 111.698 2.85221 107.202 2.85221C102.706 2.85221 100.269 5.9688 100.269 9.46162V9.89885C100.269 13.3968 102.745 16.5693 107.202 16.5693C111.658 16.5693 114.174 13.3968 114.174 9.89885V9.46162Z"
							fill="#3499CD"
						/>
						<path
							d="M36.8237 18.7097L34.5013 14.2356H24.1722L21.9093 18.7097H18.4431L27.9503 0.650772H30.6985L40.3641 18.7097H36.8237ZM29.2427 4.17409L25.4151 11.7698H33.204L29.2427 4.17409ZM55.3627 19.4164C49.0493 19.4164 46.1179 15.888 46.1179 11.2004V0.650772H49.3959V11.2512C49.3959 14.5864 51.5351 16.5693 55.6004 16.5693C59.7746 16.5693 61.4879 14.5864 61.4879 11.2512V0.650772H64.7906V11.1851C64.7906 15.6745 62.0177 19.4164 55.3627 19.4164ZM83.1712 3.47248V18.7249H79.8685V3.47248H72.1835V0.650772H90.8562V3.47248H83.1712ZM146.924 18.7097V4.41813L146.052 5.99422L138.684 18.7046H137.075L129.786 5.99422L128.915 4.41813V18.7097H125.691V0.650772H130.261L137.194 13.0409L138.016 14.5661L138.833 13.0409L145.701 0.650772H150.217V18.7097H146.924ZM175.183 18.7097L172.856 14.2356H162.536L160.293 18.7097H156.827L166.334 0.650772H169.078L178.718 18.7097H175.183ZM167.602 4.17409L163.774 11.7698H171.563L167.602 4.17409ZM192.028 3.47248V18.7249H188.731V3.47248H181.046V0.650772H199.713V3.47248H192.028ZM216.247 3.47248V18.7249H212.944V3.47248H205.259V0.650772H223.937V3.47248H216.247ZM232.068 18.7097V2.35905C233.385 2.35905 233.915 1.62693 233.915 0.650772H235.326V18.7097H232.068ZM261.169 5.75018C259.274 3.89647 256.759 2.85774 254.142 2.84713C249.443 2.84713 246.799 6.15691 246.799 9.59889V9.94969C246.799 13.3662 249.468 16.5591 254.38 16.5591C256.95 16.5094 259.409 15.4738 261.272 13.656L263.253 15.7965C260.782 18.1608 257.519 19.4572 254.142 19.4164C247.487 19.4164 243.447 14.9678 243.447 10.087V9.49212C243.447 4.61133 247.858 0 254.301 0C258.024 0 261.406 1.60151 263.214 3.60467L261.169 5.75018ZM107.609 6.69736L104.585 11.507C104.401 11.7992 104.338 12.1544 104.409 12.4945C104.48 12.8346 104.68 13.1317 104.964 13.3205L104.969 13.323C105.11 13.4165 105.267 13.4805 105.432 13.5114C105.597 13.5424 105.767 13.5397 105.931 13.5034C106.095 13.4671 106.25 13.3981 106.388 13.3001C106.526 13.2022 106.644 13.0773 106.735 12.9326L109.76 8.12296C109.943 7.83073 110.006 7.47559 109.935 7.13561C109.864 6.79563 109.664 6.49865 109.379 6.30995L109.375 6.3069C109.234 6.21345 109.076 6.14943 108.911 6.11848C108.746 6.08753 108.577 6.09027 108.413 6.12653C108.249 6.16278 108.094 6.23186 107.956 6.3298C107.818 6.42774 107.7 6.55264 107.609 6.69736Z"
							fill="black"
						/>
					</g>
					<path
						d="M18.5267 34.8197H5.95136L5.95136 39.941H15.3091V42.5955H5.95136L5.95136 49.8887H2.62653L2.62653 32.0311H18.5267V34.8197ZM45.7091 41.2817C45.7091 46.0276 41.6067 50.5858 35.252 50.5858C28.9241 50.5858 24.8217 46.0276 24.8217 41.2817V40.6918C24.8217 35.8654 28.9241 31.3876 35.252 31.3876C41.6067 31.3876 45.7091 35.8654 45.7091 40.6918V41.2817ZM42.3307 41.1744V40.7454C42.3307 37.2865 39.8102 34.203 35.252 34.203C30.6938 34.203 28.2002 37.2865 28.2002 40.7454V41.1744C28.2002 44.6333 30.6938 47.7704 35.252 47.7704C39.8102 47.7704 42.3307 44.6333 42.3307 41.1744ZM72.1649 49.8887H69.135C68.2234 49.8887 67.8212 48.6285 67.7139 47.0197L67.6066 45.1964C67.4994 43.4267 66.7754 42.6759 63.4238 42.6759H57.0959V49.8887H53.7443V32.0311H63.4774C68.8401 32.0311 71.2532 34.1762 71.2532 36.9379C71.2532 38.8953 70.2611 40.7454 66.7754 41.3889C70.2611 41.657 71.0119 43.239 71.0387 45.3304L71.0655 46.8052C71.0924 48.0386 71.3069 48.9234 72.1649 49.8082V49.8887ZM67.8748 37.5815V37.3669C67.8748 36.0799 66.8291 34.8197 63.9601 34.8197H57.0959V40.1823H64.255C66.7218 40.1823 67.8748 39.0025 67.8748 37.5815ZM112.979 49.8887H109.386L107.026 45.4645H96.5422L94.2631 49.8887H90.7237L100.376 32.0311H103.165L112.979 49.8887ZM105.712 43.0245L101.69 35.5168L97.8024 43.0245H105.712ZM138.163 49.8887H136.018L135.509 47.4755C133.793 49.4597 131.353 50.5858 128.323 50.5858C121.995 50.5858 117.893 46.2421 117.893 41.2817V40.9599C117.893 35.8922 122.37 31.3876 128.913 31.3876C132.935 31.3876 136.206 33.05 137.976 34.9538L135.884 37.072C134.275 35.5973 131.782 34.203 128.886 34.203C123.899 34.203 121.271 37.3938 121.271 40.8795V41.1744C121.271 44.6601 124.086 47.7704 128.645 47.7704C132.103 47.7704 134.57 45.6522 134.57 43.5072V43.3195H129.074V40.665H138.163V49.8887ZM162.854 49.8887L146.632 49.8887V32.0311L162.854 32.0311V34.8197L149.983 34.8197V39.4047L159.877 39.4047V42.1129L149.983 42.1129V47.1001L162.854 47.1001V49.8887ZM190.009 49.8887L187.113 49.8887L175.503 37.93L174.377 36.6698V49.8887H171.025V32.0311H174.243L185.505 43.963L186.658 45.25V32.0311H190.009V49.8887ZM218.148 34.9538L216.056 37.072C214.448 35.5973 212.088 34.203 208.897 34.203C204.125 34.203 201.443 37.4742 201.443 40.8795V41.228C201.443 44.6065 204.151 47.7704 209.139 47.7704C212.115 47.7704 214.582 46.3493 216.137 44.9014L218.148 47.0197C216.19 48.9502 212.866 50.5858 208.924 50.5858C202.167 50.5858 198.065 46.1885 198.065 41.3621V40.7722C198.065 35.9459 202.543 31.3876 209.085 31.3876C212.866 31.3876 216.298 32.9696 218.148 34.9538ZM229.292 49.8887H225.94V32.0311H229.292V49.8887ZM254.642 49.8887H238.42V32.0311H254.642V34.8197H241.771V39.4047H251.665V42.1129H241.771V47.1001H254.642V49.8887ZM280.51 44.8746C280.51 48.3603 276.702 50.5858 271.393 50.5858C267.774 50.5858 264.422 49.5937 261.66 48.2799L262.894 45.6254C265.709 47.0197 268.685 47.8509 271.554 47.8509C275.415 47.8509 277.131 46.5907 277.131 45.2232C277.131 40.9599 262.17 43.8021 262.17 37.2597C262.17 33.9349 265.763 31.3876 271.42 31.3876C274.933 31.3876 278.204 32.621 280.215 33.9349L278.392 36.1872C276.729 35.1146 273.994 34.1226 271.313 34.1226C267.827 34.1226 265.521 35.3023 265.521 36.8307C265.521 40.7186 280.51 38.1177 280.51 44.8746Z"
						fill="black"
					/>
					<defs>
						<clipPath id="clip0_6816_1592">
							<rect width="244.785" height="19.4164" fill="white" transform="translate(18.4431)" />
						</clipPath>
					</defs>
				</svg>
			);
		}

		switch ( partnerSlug ) {
			case 'dreamhost':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 662.5 }
						viewBox="0 0 1270 170"
						partnerName="DreamHost"
					>
						<AsyncLoad
							require="calypso/components/jetpack-header/dreamhost"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'pressable':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 600 }
						viewBox="0 0 1150 170"
						partnerName="Pressable"
					>
						<AsyncLoad
							require="calypso/components/jetpack-header/pressable"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'bluehost':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 588 }
						viewBox="0 0 1128 170"
						partnerName="Bluehost"
					>
						<AsyncLoad
							require="calypso/components/jetpack-header/bluehost"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'inmotion':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 488 }
						viewBox="0 0 936 151"
						partnerName="InMotion"
					>
						<AsyncLoad
							require="calypso/components/jetpack-header/inmotion"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'milesweb':
				// This is a raster logo that contains the Jetpack logo already.
				return (
					<AsyncLoad
						require="calypso/components/jetpack-header/milesweb"
						darkColorScheme={ darkColorScheme }
						placeholder={ null }
					/>
				);

			case 'liquidweb':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 488 }
						viewBox="0 0 1034 150"
						partnerName="Liquid Web"
					>
						<AsyncLoad
							require="calypso/components/jetpack-header/liquidweb"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);
			case 'eurodns':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 488 }
						viewBox="0 0 1034 150"
						partnerName="EuroDNS"
					>
						<AsyncLoad
							require="calypso/components/jetpack-header/eurodns"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);
			default:
				return <JetpackLogo full size={ width || 45 } />;
		}
	}

	render() {
		return <div className="jetpack-header">{ this.renderLogo() }</div>;
	}
}

export default localize( JetpackHeader );
