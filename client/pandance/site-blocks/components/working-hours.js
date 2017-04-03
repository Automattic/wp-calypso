/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

export default props => <div>
	<SectionHeader label="We’re Open"></SectionHeader>
	<Card>
		<dl>
			<dt>Monday – Friday</dt>
			<dd>11AM—7PM</dd>
			<dt>Saturday and Sunday</dt>
			<dd>Closed</dd>
		</dl>
	</Card>
</div>;

