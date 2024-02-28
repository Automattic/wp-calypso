import classNames from 'classnames';
import { ReactNode } from 'react';

type Props = {
	title: string;
	description: string;
	children: ReactNode;
	isTwoColumns?: boolean;
};

export default function LicensesFormSection( {
	title,
	description,
	children,
	isTwoColumns,
}: Props ) {
	return (
		<div className={ classNames( 'licenses-form__section', { 'is-two-columns': isTwoColumns } ) }>
			<h2 className="licenses-form__section-title">
				<span>{ title }</span>
				<hr />
			</h2>
			<p className="licenses-form__section-description">{ description }</p>

			<div className="licenses-form__section-content">{ children }</div>
		</div>
	);
}
