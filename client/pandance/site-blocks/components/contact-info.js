/**
 * External dependencies
 */
import React from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';

import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextArea from 'components/forms/form-textarea';

export default props => <div>
	<SectionHeader label="Contact Us"></SectionHeader>
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

export const EditContactInfo = prop => <div>
	<FormFieldset>
		<FormLabel>Message</FormLabel>
		<FormTextArea placeholder="You're awesome!"></FormTextArea>
	</FormFieldset>
</div>;
