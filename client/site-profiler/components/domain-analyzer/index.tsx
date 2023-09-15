import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FormEvent } from 'react';
import './styles.scss';

interface Props {
	onFormSubmit: ( domain: string ) => void;
	isBusy?: boolean;
}

export default function DomainAnalyzer( props: Props ) {
	const translate = useTranslate();
	const { isBusy, onFormSubmit } = props;

	const onSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		const domainEl = e.currentTarget.elements.namedItem( 'domain' ) as HTMLInputElement;
		const domain = domainEl.value;

		domain && onFormSubmit( domain );
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
						<Button isBusy={ isBusy } type="submit">
							{ translate( 'Check site' ) }
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
