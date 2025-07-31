import type { Presentation } from '../store/slices/presentationSlice';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Presentation methods
  async getPresentations(): Promise<Presentation[]> {
    return this.request<Presentation[]>('/presentations');
  }

  async getPresentation(id: string): Promise<Presentation> {
    return this.request<Presentation>(`/presentations/${id}`);
  }

  async createPresentation(data: { title: string; creatorNickname: string }): Promise<Presentation> {
    return this.request<Presentation>('/presentations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePresentation(id: string, data: Partial<Presentation>): Promise<Presentation> {
    return this.request<Presentation>(`/presentations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePresentation(id: string): Promise<void> {
    return this.request<void>(`/presentations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();