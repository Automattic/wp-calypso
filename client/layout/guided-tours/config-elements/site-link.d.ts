import type { Component } from 'react';

interface SiteLinkProps {
	href?: string;
	isButton?: boolean;
	isPrimaryButton?: boolean;
	newWindow?: boolean;
	children?: React.ReactNode;
}

declare class SiteLink extends Component< SiteLinkProps, any > {}

export default SiteLink;
