/**
 * External dependencies
 */
import React from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';

import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextArea from 'components/forms/form-textarea';

let something = 'Vila Catalina\nParc del Garraf\nC-15B\n08810 Sant Pere de Ribes\nBarcelona, Spain\n';

export const ContactInfo = props => <div className="contact-info section">
	<Card>
		<h3 className="section-title">Contact Us</h3>
		<pre>
			{ something }
		</pre>
	</Card>
</div>;

export const EditContactInfo = prop => <div>
	<FormFieldset>
		<FormLabel>Address</FormLabel>
		<FormTextArea placeholder="5 Awesome Rd, Peterstown, 202020 GRT!" onChange={(event) => { something = event.target.value; } }></FormTextArea>
	</FormFieldset>
</div>;
