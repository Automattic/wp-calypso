import { ReactNode } from 'react';
import './style.scss';
import { SectionBackground } from './backgrounds';

export type HostingSectionProps = {
	children: ReactNode;
	heading: string;
	subheading?: string;
	icon?: ReactNode;
	description?: string;
	background?: SectionBackground;
};

export default function HostingSection( {
	icon,
	heading,
	subheading,
	description,
	children,
	background,
}: HostingSectionProps ) {
	return (
		<div
			className="hosting-section-wrapper"
			style={ {
				backgroundColor: background?.color,
				backgroundImage: background?.image,
				backgroundSize: background?.size,
			} }
		>
			<div className="hosting-section">
				<div className="hosting-section__sub-header">
					{ icon && <div className="hosting-section__icon">{ icon }</div> }
					{ subheading && (
						<span className="hosting-section__sub-header-title">{ subheading }</span>
					) }
				</div>

				<div className="hosting-section__header">
					<h2 className="hosting-section__header-title">{ heading }</h2>

					{ description && <p className="hosting-section__header-description">{ description }</p> }
				</div>
				{ children }
			</div>
		</div>
	);
}
