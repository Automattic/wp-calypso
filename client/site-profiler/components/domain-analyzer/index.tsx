import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, useState } from 'react';
import './styles.scss';

export default function DomainAnalyzer() {
	const translate = useTranslate();
	const [ , setDomain ] = useState( '' );

	const onSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		const domainEl = e.currentTarget.elements.namedItem( 'domain' ) as HTMLInputElement;
		setDomain( domainEl.value );
	};

	return (
		<div className="domain-analyzer">
			<h1>{ translate( 'Who Hosts This Site?' ) }</h1>
			<p>
				{ translate(
					'Access essential information about a site, such as hosting provider, domain details, and contact information.'
				) }
			</p>

			<form className="domain-analyzer--form" onSubmit={ onSubmit }>
				<div className="domain-analyzer--form-container">
					<div className="col-1">
						<input type="text" name="domain" placeholder={ translate( 'mysite.com' ) } />
					</div>
					<div className="col-2">
						<Button type="submit">{ translate( 'Check site' ) }</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
