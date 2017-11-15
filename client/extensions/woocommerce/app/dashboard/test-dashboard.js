/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import DashboardWidgetRow from 'woocommerce/components/dashboard-widget-row';

// This is all throw-away code, please don't review.

class TestDashboard extends Component {
	render = () => {
		return (
			<div className="dashboard__setup-wrapper">
				<DashboardWidget
					title="Full Width"
					imagePosition="bottom"
					image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					imageFlush
				>
					<p>Image position set to bottom imageFlush true</p>
					<p>
						<Button href="#">Some Random Button</Button>
					</p>
				</DashboardWidget>

				<DashboardWidgetRow>
					<DashboardWidget
						title="Third Width"
						imagePosition="top"
						width="third"
						imageFlush
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to top imageFlush true.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
					<DashboardWidget
						title="Third Width"
						imagePosition="top"
						width="third"
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to top imageFlush false.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
					<DashboardWidget
						title="Third Width"
						imagePosition="bottom"
						width="third"
						imageFlush
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to bottom imageFlush true.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
				</DashboardWidgetRow>

				<DashboardWidget
					title="Full Width"
					imagePosition="top"
					image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
				>
					<p>Image position set to top imageFlush false</p>
					<p>
						<Button href="#">Some Random Button</Button>
					</p>
				</DashboardWidget>

				<DashboardWidgetRow>
					<DashboardWidget
						title="Half Width"
						imagePosition="top"
						width="half"
						imageFlush
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to top imageFlush true.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
					<DashboardWidget
						title="Half Width"
						imagePosition="top"
						width="half"
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to top imageFlush false.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
				</DashboardWidgetRow>

				<DashboardWidget
					title="Full Width"
					imagePosition="left"
					image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					imageFlush
				>
					<p>Image position set to left imageFlush true</p>
					<p>
						<Button href="#">Some Random Button</Button>
					</p>
				</DashboardWidget>

				<DashboardWidgetRow>
					<DashboardWidget
						title="Two Thirds Width"
						imagePosition="bottom"
						width="two-thirds"
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to bottom imageFlush false.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
					<DashboardWidget
						title="Third Width"
						imagePosition="top"
						width="third"
						imageFlush
						image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					>
						<p>Image position set to top imageFlush true.</p>
						<p>
							<Button href="#">Button</Button>
						</p>
					</DashboardWidget>
				</DashboardWidgetRow>

				<DashboardWidget
					title="Full Width"
					imagePosition="right"
					image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
				>
					<p>Image position set to right imageFlush false</p>
					<p>
						<Button href="#">Some Random Button</Button>
					</p>
				</DashboardWidget>
			</div>
		);
	};
}

export default TestDashboard;
