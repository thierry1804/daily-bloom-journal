import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  ogType?: string;
}

export const useSEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonical,
  ogType = 'website'
}: SEOProps) => {
  useEffect(() => {
    // Mettre à jour le titre
    document.title = title;
    
    // Fonction helper pour mettre à jour ou créer un meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    // Mettre à jour la meta description
    updateMetaTag('description', description);
    
    // Mettre à jour les Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonical || window.location.href, true);
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }
    
    // Twitter cards
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage);
    }
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || window.location.href);
    
    // Keywords (optionnel)
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
  }, [title, description, keywords, ogImage, canonical, ogType]);
};

