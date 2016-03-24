import React from 'react';

import Card from 'components/card';

export const InfoHeader = React.createClass( {
	render() {
		return (
			<Card className="wpcom-plugins-info-header">
				<div>
					Uploading and installing your own plugins is not
					available on WordPress.com, but we offer the most
					essential ones below.
					<a
						href="https://en.support.wordpress.com/plugins/"
						target="_blank"
					>
						Learn more
					</a>.
				</div>
			</Card>
		);
	}
} );

export default InfoHeader;
