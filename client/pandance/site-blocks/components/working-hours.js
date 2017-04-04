/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

export default props => <div className="hours">
	<Card>
		<dl>
			<dt>Monday – Friday</dt>
			<dd>11AM—7PM</dd>
			<dt>Saturday and Sunday</dt>
			<dd>Closed</dd>
		</dl>
	</Card>
</div>;

