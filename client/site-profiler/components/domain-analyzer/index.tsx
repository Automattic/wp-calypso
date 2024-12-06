import { Button } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, KeyboardEvent } from 'react';
import './styles.scss';

interface Props {
	domain?: string;
	isBusy?: boolean;
	isBusyForWhile?: boolean;
	isDomainValid?: boolean;
	domainFetchingError?: Error;
	onFormSubmit: ( domain: string ) => void;
}

export default function DomainAnalyzer( props: Props ) {
	const translate = useTranslate();
	const { domain, isBusy, isBusyForWhile, isDomainValid, domainFetchingError, onFormSubmit } =
		props;

	const showError = isDomainValid === false || domainFetchingError;

	const onSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		const domainEl = e.currentTarget.elements.namedItem( 'domain' ) as HTMLInputElement;
		const domain = domainEl.value;

		onFormSubmit( domain );
	};

	const onInputEscape = ( e: KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Escape' ) {
			e.currentTarget.value = '';
			onFormSubmit( '' );
		}
	};

	return (
		<div className="domain-analyzer">
			<h1>{ translate( 'Site Profiler' ) }</h1>
			<p>
				{ translate(
					'Access the essential information about any site, including hosting provider, domain details, and contact information.'
				) }
			</p>

			<form
				className={ clsx( 'domain-analyzer--form', { 'is-error': showError } ) }
				onSubmit={ onSubmit }
			>
				<div className="domain-analyzer--form-container">
					<div className="col-1">
						<input
							type="text"
							name="domain"
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							autoComplete="off"
							defaultValue={ domain }
							placeholder={ translate( 'Enter a site URL' ) }
							key={ domain || 'empty' }
							onKeyDown={ onInputEscape }
							spellCheck="false"
						/>
						<div className="domain-analyzer--msg">
							<p
								className={ clsx( 'error', {
									'vis-hidden': ! showError,
								} ) }
							>
								<Icon icon={ info } size={ 20 } />{ ' ' }
								{ isDomainValid === false && translate( 'Please enter a valid website address' ) }
								{ domainFetchingError && domainFetchingError.message }
							</p>
						</div>
					</div>
					<div className="col-2">
						<Button variant="primary" isBusy={ isBusy } type="submit" className="button-action">
							{
								// translators: "Still checking" stands for "Still checking the domain you entered in the form"
								isBusyForWhile && domain && isDomainValid
									? translate( 'Still checking…' )
									: translate( 'Check site' )
							}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
