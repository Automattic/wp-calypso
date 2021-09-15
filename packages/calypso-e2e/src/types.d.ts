export type TargetDevice = 'desktop' | 'mobile' | 'laptop' | 'tablet';
export type Plans = typeof PlansArray[ number ];
export const PlansArray = [ 'Free', 'Personal', 'Premium', 'Business', 'eCommerce' ] as const;
