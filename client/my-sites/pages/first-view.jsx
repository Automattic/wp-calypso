/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FirstView from 'components/first-view';

export default React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		return (
			<FirstView>
				<div>
					{ this.renderIcon() }
					<h1>{ this.translate( 'Pages First View Placeholder' ) }</h1>
					{ /* eslint-disable max-len */ }
					<p>{ this.translate( 'The Pages page shows you pages.' ) }</p>
					{ /* eslint-enable max-len */ }
				</div>
			</FirstView>
		);
	},

	renderIcon() {
		// embedded; original file: /public/images/stats/illustration-stats.svg
		/* eslint-disable max-len, wpcalypso/jsx-classname-namespace */
		return (
			<div className="first-view__icon">
				<svg x="0px" y="0px" viewBox="0 0 792 612" enable-background="new 0 0 792 612">
					<g>
						<circle fill="#D2DCE4" cx="395.8" cy="305.5" r="287.1"/>
						<rect x="219.8" y="267.8" fill="#8FACBF" width="101" height="219.4"/>
						<rect x="344.2" y="153" fill="#8FACBF" width="101" height="334.2"/>
						<rect x="394.7" y="152.6" opacity="8.000000e-02" fill="#485566" width="50.5" height="334.6"/>
						<rect x="468.6" y="210.6" fill="#8FACBF" width="101" height="276.6"/>
						<rect x="271.1" y="267.8" opacity="8.000000e-02" fill="#485566" width="49.7" height="219.4"/>
						<rect x="519.5" y="210.2" opacity="8.000000e-02" fill="#485566" width="50" height="277"/>
						<path opacity="0.45" fill="#647A88" d="M406.2,402.6"/>
						<g>
							<path opacity="0.4" fill="#647A88" d="M398.5,377.5l-27.5,19.6l-17.1-14.7c-0.8,1.1-1.6,2.3-2.3,3.5l-7.4-4.7v20.2l3.5,2.3
								c1.4,15.9,14.6,28.3,30.8,28.3c17.1,0,31-13.9,31-31c0-5.1-1.2-9.8-3.4-14l39-59.2v-31l-49.4,74.8L398.5,377.5z"/>
							<path opacity="0.4" fill="#647A88" d="M548.2,317l-1.2-11.5c-1.4,1.5-2.6,3-3.7,4.7l-40.7-31.1c1.2-1.8,2.2-3.7,3.1-5.7
								l-23.7-16.5h-13.5v34.1c2.8,0.8,5.7,1.3,8.7,1.3c4.1,0,8-0.8,11.6-2.3l49.7,38c0.8,16.3,14.1,29.3,30.6,29.5v-37L548.2,317z"/>
							<path opacity="0.4" fill="#647A88" d="M292.5,335.7l-56,2l-3.4-1.8c0.9,3,2.2,5.7,3.8,8.2l-17.1,17.1v24.1l30.1-30
								c3.9,1.8,8.2,2.8,12.8,2.8c4.5,0,8.8-1,12.7-2.8l45.3,28.9v-20.2l-31.9-20.3C290.4,341.2,291.6,338.5,292.5,335.7z"/>
						</g>
						<path opacity="0.17" fill="#FFFFFF" d="M569.2,335.7L474.8,264l-97.7,140.7l-121.2-81L139.4,434.6c47.3,93.7,144.3,158,256.4,158
							c158.6,0,287.1-128.5,287.1-287.1c0-41.2-8.8-80.4-24.4-115.8L569.2,335.7z"/>
						<path fill="#647A88" d="M652.4,176.7l-85.2,137.6l-96.3-73.6l-94.9,143.8L257.5,309L136.8,429.3c2.6,5.4,5.4,10.7,8.3,15.8
							l114.8-114.4l121.2,77.2l94-142.6l96.7,73.9l89.1-144C658.3,189,655.5,182.8,652.4,176.7z"/>
						<g>
							<circle fill="#FFFFFF" cx="378.5" cy="395.3" r="25.2"/>
						</g>
						<g>
							<circle fill="#FFFFFF" cx="262.7" cy="323.7" r="25.2"/>
						</g>
						<path fill="#F0F3F4" d="M262.7,298.6v50.3c13.9,0,25.2-11.3,25.2-25.2C287.9,309.8,276.6,298.6,262.7,298.6z"/>
						<path fill="#F0F3F4" d="M378.5,370.1v50.3c13.9,0,25.2-11.3,25.2-25.2C403.7,381.4,392.4,370.1,378.5,370.1z"/>
						<g>
							<circle fill="#FFFFFF" cx="477.3" cy="258.5" r="25.2"/>
						</g>
						<path fill="#F0F3F4" d="M477.3,233.4v50.3c13.9,0,25.2-11.3,25.2-25.2C502.5,244.6,491.2,233.4,477.3,233.4z"/>
						<g>
							<circle fill="#FFFFFF" cx="569.5" cy="323.7" r="25.2"/>
						</g>
						<path fill="#F0F3F4" d="M569.2,298.6v50.3c13.9,0,25.2-11.3,25.2-25.2C594.4,309.8,583.1,298.6,569.2,298.6z"/>
					</g>
				</svg>
			</div>
		);
		/* eslint-enable max-len, wpcalypso/jsx-classname-namespace */
	}
} );
