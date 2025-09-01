import React, { useState } from 'react';
import { Check, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SlideGrid = ({ slides, onSlideSelectionChange, categories }) => {
  const [selectedSlides, setSelectedSlides] = useState(new Set());
  const [slideCategories, setSlideCategories] = useState({});

  const toggleSlideSelection = (slideIndex) => {
    const newSelected = new Set(selectedSlides);
    if (newSelected.has(slideIndex)) {
      newSelected.delete(slideIndex);
      // Remove category assignment when deselecting
      const newCategories = { ...slideCategories };
      delete newCategories[slideIndex];
      setSlideCategories(newCategories);
    } else {
      newSelected.add(slideIndex);
    }
    setSelectedSlides(newSelected);
    updateParent(newSelected, slideCategories);
  };

  const assignCategory = (slideIndex, category) => {
    const newCategories = { ...slideCategories, [slideIndex]: category };
    setSlideCategories(newCategories);
    updateParent(selectedSlides, newCategories);
  };

  const updateParent = (selected, categories) => {
    const updatedSlides = slides.map((slide, index) => ({
      ...slide,
      selected: selected.has(index),
      category: categories[index] || null
    }));
    onSlideSelectionChange(updatedSlides);
  };

  const selectAll = () => {
    const allIndices = new Set(slides.map((_, index) => index));
    setSelectedSlides(allIndices);
    updateParent(allIndices, slideCategories);
  };

  const clearAll = () => {
    setSelectedSlides(new Set());
    setSlideCategories({});
    updateParent(new Set(), {});
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Summary': 'bg-blue-100 text-blue-800 border-blue-200',
      'Track Record': 'bg-green-100 text-green-800 border-green-200',
      'Details': 'bg-purple-100 text-purple-800 border-purple-200',
      'Team': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Select Slides ({selectedSlides.size} of {slides.length} selected)
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={selectAll} size="sm">
            Select All
          </Button>
          <Button variant="outline" onClick={clearAll} size="sm">
            Clear All
          </Button>
        </div>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
              selectedSlides.has(index)
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg'
            }`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <button
                onClick={() => toggleSlideSelection(index)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedSlides.has(index)
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedSlides.has(index) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4 opacity-0" />
                )}
              </button>
            </div>

            {/* Slide Image */}
            <div className="aspect-[4/3] bg-gray-100">
              <img
                src={slide.thumbnail_b64}
                alt={`Slide ${slide.page}`}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => toggleSlideSelection(index)}
              />
            </div>

            {/* Slide Info */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-900">
                  Slide {slide.page}
                </span>
                {slideCategories[index] && (
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(slideCategories[index])}`}>
                    {slideCategories[index]}
                  </span>
                )}
              </div>

              {/* Category Assignment */}
              {selectedSlides.has(index) && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    Assign Category:
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => assignCategory(index, category)}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          slideCategories[index] === category
                            ? getCategoryColor(category)
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {selectedSlides.size > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Selection Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = Object.values(slideCategories).filter(c => c === category).length;
              return (
                <div key={category} className="text-center">
                  <div className={`px-3 py-2 rounded-lg ${getCategoryColor(category)}`}>
                    <div className="font-semibold">{count}</div>
                    <div className="text-xs">{category}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideGrid;

