/**
 * External dependencies
 */
import React from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';

export default props => <div className="contact-info section">
	<Card>
		<h3 className="section-title">Contact Us</h3>
		<p>Phone: <a href="tel:+87326432878624">+87326432878624</a></p>
		<p>Vila Catalina<br />
			Parc del Garraf<br />
			C-15B<br />
			08810 Sant Pere de Ribes<br />
			Barcelona, Spain<br />
		</p>
	</Card>
</div>;

