/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

export default props => <div className="hours section">
	<Card>
		<h3 className="section-title">Hours</h3>
		<dl>
			<dt>Monday – Friday</dt>
			<dd>11AM—7PM</dd>
			<dt>Saturday and Sunday</dt>
			<dd>Closed</dd>
		</dl>
	</Card>
</div>;

