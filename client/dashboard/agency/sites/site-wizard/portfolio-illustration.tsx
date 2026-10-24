import { __ } from '@wordpress/i18n';
import PortfolioFolios from './portfolio-folios';
import PortfolioNodes from './portfolio-nodes';
import PortfolioObjects from './portfolio-objects';
import PortfolioRows from './portfolio-rows';
import PortfolioSites from './portfolio-sites';
import type { PortfolioIllustrationVariant } from './portfolio-variants';
import './portfolio-illustration.scss';

function PortfolioList() {
	const sites = [
		{
			name: 'Juniper Studio',
			domain: 'juniper.example',
			initial: 'J',
			host: 'WordPress.com',
			status: __( 'Public' ),
		},
		{
			name: 'Fern & Co',
			domain: 'fern.example',
			initial: 'F',
			host: 'Pressable',
			status: __( 'Public' ),
		},
		{
			name: 'Paper Plane',
			domain: 'paperplane.example',
			initial: 'P',
			host: __( 'Other host' ),
			status: __( 'Private' ),
		},
	];
	return (
		<div className="agency-sites-story__portfolio">
			<table className="agency-sites-story__portfolio-table">
				<thead>
					<tr>
						<th>{ __( 'Site' ) }</th>
						<th>{ __( 'Visibility' ) }</th>
						<th className="agency-sites-story__host-column">{ __( 'Host' ) }</th>
					</tr>
				</thead>
				<tbody>
					{ sites.map( ( site ) => (
						<tr key={ site.name }>
							<td>
								<div className="agency-sites-story__site-identity">
									<span className="agency-sites-story__site-icon">{ site.initial }</span>
									<div className="agency-sites-story__site-name">
										<strong>{ site.name }</strong>
										<bdi>{ site.domain }</bdi>
									</div>
								</div>
							</td>
							<td>{ site.status }</td>
							<td className="agency-sites-story__host-column">{ site.host }</td>
						</tr>
					) ) }
				</tbody>
			</table>
		</div>
	);
}

function ClientFolio() {
	return (
		<svg
			className="agency-portfolio-art agency-portfolio-art--folio"
			viewBox="0 0 480 340"
			aria-hidden="true"
			focusable="false"
		>
			<g className="agency-portfolio-art__folio-right">
				<g transform="rotate(7 350 270) translate(274 48)">
					<rect className="agency-portfolio-art__paper" width="152" height="222" rx="5" />
					<path d="M0 20h152" />
					<path className="agency-portfolio-art__fine" d="M10 10h1m6 0h1m6 0h1m106 0h12" />
					<path d="M14 38h69m-69 9h40" />
					<rect
						className="agency-portfolio-art__wash"
						x="14"
						y="61"
						width="124"
						height="68"
						rx="2"
					/>
					<circle cx="77" cy="95" r="22" />
					<path d="m66 109 11-28 11 28m-18-9h14" />
					<path
						className="agency-portfolio-art__fine"
						d="M14 144h124m-124 8h118m-118 8h92m-92 21h47m-47 8h47m17-8h60m-60 8h53m-117 19h31"
					/>
				</g>
			</g>
			<g className="agency-portfolio-art__folio-left">
				<g transform="rotate(-7 134 274) translate(58 52)">
					<rect className="agency-portfolio-art__paper" width="152" height="222" rx="5" />
					<path d="M0 20h152" />
					<path className="agency-portfolio-art__fine" d="M10 10h1m6 0h1m6 0h1m106 0h12" />
					<rect
						className="agency-portfolio-art__wash"
						x="14"
						y="35"
						width="124"
						height="87"
						rx="2"
					/>
					<path d="m15 102 38-41 34 39 20-21 30 35" />
					<circle className="agency-portfolio-art__accent" cx="112" cy="55" r="8" />
					<path d="M14 139h86m-86 10h62" />
					<path
						className="agency-portfolio-art__fine"
						d="M14 164h124m-124 8h116m-116 8h103m-103 23h31"
					/>
				</g>
			</g>
			<g className="agency-portfolio-art__folio-front">
				<g transform="translate(152 70)">
					<rect className="agency-portfolio-art__paper" width="176" height="236" rx="5" />
					<path d="M0 22h176" />
					<path
						className="agency-portfolio-art__fine"
						d="M11 11h1m6 0h1m6 0h1m120 0h19M12 39h27m66 0h16m9 0h14m9 0h11"
					/>
					<rect
						className="agency-portfolio-art__wash"
						x="12"
						y="52"
						width="152"
						height="77"
						rx="2"
					/>
					<path
						className="agency-portfolio-art__accent"
						d="M88 116V66m0 28c-19 0-28-10-28-20 17 0 28 6 28 20Zm0-12c17 0 25-9 25-20-16 0-25 7-25 20Z"
					/>
					<path d="M48 145h80" />
					<path className="agency-portfolio-art__fine" d="M60 154h56" />
					{ [ 12, 66, 120 ].map( ( x ) => (
						<g key={ x } transform={ `translate(${ x } 168)` }>
							<rect className="agency-portfolio-art__wash" width="44" height="35" rx="2" />
							<path
								className="agency-portfolio-art__fine"
								d="M16 14h12l-2 13h-8Zm6 0V8m0 5c-5 0-7-3-7-6 5 0 7 2 7 6Zm0-3c5 0 7-3 7-6-5 0-7 2-7 6ZM3 44h30m-30 7h17"
							/>
						</g>
					) ) }
				</g>
			</g>
		</svg>
	);
}

export default function PortfolioIllustration( {
	variant,
}: {
	variant: PortfolioIllustrationVariant;
} ) {
	switch ( variant ) {
		case 'list':
			return <PortfolioList />;
		case 'keyring':
			return <PortfolioObjects />;
		case 'sites-list':
		case 'sites-grid':
		case 'sites-lens':
			return <PortfolioSites variant={ variant } />;
		case 'folio':
			return <ClientFolio />;
		case 'fan':
		case 'cascade':
		case 'stacks':
			return <PortfolioFolios variant={ variant } />;
		case 'loose-rows':
		case 'columns':
		case 'paper-roll':
			return <PortfolioRows variant={ variant } />;
		default:
			return <PortfolioNodes variant={ variant } />;
	}
}
