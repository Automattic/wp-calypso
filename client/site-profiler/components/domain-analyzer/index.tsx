import { Button } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FormEvent } from 'react';
import './styles.scss';

interface Props {
	domain?: string;
	isBusy?: boolean;
	isBusyForWhile?: boolean;
	isDomainValid?: boolean;
	onFormSubmit: ( domain: string ) => void;
}

export default function DomainAnalyzer( props: Props ) {
	const translate = useTranslate();
	const { domain, isBusy, isBusyForWhile, isDomainValid, onFormSubmit } = props;

	const onSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		const domainEl = e.currentTarget.elements.namedItem( 'domain' ) as HTMLInputElement;
		const domain = domainEl.value;

		onFormSubmit( domain );
	};

	return (
		<div className="domain-analyzer">
			<h1>{ translate( 'Site Profiler' ) }</h1>
			<p>
				{ translate(
					'Access essential information about a site, such as hosting provider, domain details, and contact information.'
				) }
			</p>

			<form
				className={ classnames( 'domain-analyzer--form', { 'is-error': isDomainValid === false } ) }
				onSubmit={ onSubmit }
			>
				<div className="domain-analyzer--form-container">
					<div className="col-1">
						<input
							type="text"
							name="domain"
							autoComplete="off"
							defaultValue={ domain }
							placeholder={ translate( 'Enter a website URL' ) }
						/>
					</div>
					<div className="col-2">
						<Button isBusy={ isBusy } type="submit" className="button-action">
							{
								// translators: "Still checking" stands for "Still checking the domain you entered in the form"
								isBusyForWhile && domain && isDomainValid
									? translate( 'Still checking…' )
									: translate( 'Check site' )
							}
						</Button>
					</div>
				</div>
				<div className="domain-analyzer--msg">
					{ ( isDomainValid || isDomainValid === undefined ) && (
						<p className="center">{ translate( 'Enter the URL of the site you want to check' ) }</p>
					) }
					{ isDomainValid === false && (
						<p className="error">
							<Icon icon={ info } size={ 20 } />{ ' ' }
							{ translate( 'Please enter a valid website address' ) }
						</p>
					) }
				</div>
			</form>
		</div>
	);
}
