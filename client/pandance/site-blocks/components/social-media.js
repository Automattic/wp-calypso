/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import SocialLogo from 'social-logos';

export default props => <div>
	<SectionHeader label="Find Us On Social Media"></SectionHeader>
	<Card>
		<a href="https://facebook.com/manuel"><SocialLogo size="48" icon="facebook" /></a>
		<a href="https://twitter.com/manuel"><SocialLogo size="48" icon="twitter-alt" /></a>
		<a href="https://instagram.com/manuel"><SocialLogo size="48" icon="instagram" /></a>
		<a href="https://manuel.wordpress.com/"><SocialLogo size="48" icon="wordpress" /></a>
	</Card>
</div>;

