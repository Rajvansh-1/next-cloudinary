import { ImageProps } from 'next/image';
import { getCldImageUrl } from '../helpers/getCldImageUrl';

/**
 * Options specific to Cloudinary transformations.
 */
export interface CloudinaryLoaderCldOptions {
  format?: string; // e.g., 'webp', 'jpg'
  quality?: string | number; // e.g., 'auto', 80
  crop?: 'fill' | 'fit' | 'scale';
  gravity?: 'auto' | 'face' | 'center';
  [key: string]: any; // additional Cloudinary params
}

/**
 * Loader-specific overrides for image sizing.
 */
export interface CloudinaryLoaderLoaderOptions {
  width?: number;
  height?: number;
}

/**
 * Full input for the Cloudinary loader function.
 */
export interface CloudinaryLoaderInput {
  loaderOptions?: CloudinaryLoaderLoaderOptions;
  imageProps: ImageProps;
  cldOptions?: CloudinaryLoaderCldOptions;
  cldConfig?: Record<string, any>;
}

/**
 * Helper to preserve aspect ratio based on width multiplier.
 */
function applyAspectRatio(originalWidth: number, originalHeight: number, newWidth: number) {
  return Math.floor((originalHeight / originalWidth) * newWidth);
}

/**
 * Cloudinary loader for Next.js Image component.
 * Produces optimized URLs based on imageProps, loader options, and Cloudinary configuration.
 */
export function cloudinaryLoader({
  loaderOptions = {},
  imageProps,
  cldOptions = {},
  cldConfig = {}
}: CloudinaryLoaderInput) {
  // Start with default imageProps and Cloudinary options
  const options: Record<string, any> = {
    ...imageProps,
    ...cldOptions
  };

  // Ensure width and height are numbers
  options.width = typeof options.width === 'string' ? parseInt(options.width, 10) : options.width;
  options.height = typeof options.height === 'string' ? parseInt(options.height, 10) : options.height;

  // Apply loaderOptions overrides while maintaining aspect ratio
  if (loaderOptions.width && options.width && loaderOptions.width !== options.width) {
    const multiplier = loaderOptions.width / options.width;
    options.width = loaderOptions.width;

    if (options.height) {
      options.height = Math.floor(options.height * multiplier);
    }
  } else if (loaderOptions.width && !options.width) {
    // Handle Next.js fill mode
    options.width = loaderOptions.width;
  }

  if (loaderOptions.height && !options.height) {
    // Compute height for responsive fill mode if missing
    options.height = applyAspectRatio(options.width || loaderOptions.width || 0, options.height || 0, loaderOptions.width || options.width || 0);
  }

  // Future-proof: merge any additional Cloudinary config parameters
  const finalConfig = {
    ...cldConfig,
    transformations: {
      ...cldOptions,
      width: options.width,
      height: options.height
    }
  };

  return getCldImageUrl(options, finalConfig);
}
