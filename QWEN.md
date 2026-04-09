# QWEN.md — my-next-app

## Project Overview

Это пустой проект **Next.js 16**, созданный с помощью `create-next-app`. Проект использует современный стек технологий и готов к разработке веб-приложения.

**Технологии:**
- **Next.js 16.2.3** — React-фреймворк с App Router
- **React 19.2.4** / **React DOM 19.2.4**
- **TypeScript 5** — строгая типизация
- **Tailwind CSS 4** — утилитарный CSS-фреймворк
- **ESLint 9** — линтинг кода
- **Geist / Geist_Mono** — шрифты от Vercel

**Архитектура:**
- **App Router** — маршрутизация на основе файловой системы в `src/app/`
- **src directory** — исходный код находится в папке `src/`
- **Path alias** — `@/*` маппится на `./src/*`

## Directory Structure

```
my-next-app/
├── src/
│   └── app/
│       ├── layout.tsx      # Корневой лейаут с шрифтами и метаданными
│       ├── page.tsx        # Главная страница (/)
│       └── globals.css     # Глобальные стили с Tailwind и CSS-переменными
├── public/                 # Статические файлы (изображения, favicon и т.д.)
├── .gitignore
├── eslint.config.mjs       # Конфигурация ESLint
├── next.config.ts          # Конфигурация Next.js
├── package.json
├── postcss.config.mjs      # Конфигурация PostCSS
├── tsconfig.json           # Конфигурация TypeScript
└── README.md
```

## Building and Running

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера (http://localhost:3000) |
| `npm run build` | Сборка для production |
| `npm run start` | Запуск production-сервера |
| `npm run lint` | Запуск ESLint |

## Development Conventions

- **TypeScript**: включён строгий режим (`strict: true`)
- **ESLint**: используется `eslint-config-next` с правилами для Core Web Vitals и TypeScript
- **Tailwind CSS v4**: используется новый синтаксис с `@import "tailwindcss"` и `@theme inline`
- **Шрифты**: оптимизация через `next/font` (Geist Sans + Geist Mono)
- **Тёмная тема**: поддержка через `prefers-color-scheme: dark` в `globals.css`
- **Path aliases**: используйте `@/` для импортов из `src/`, например `@/components/Button`

## Key Files

- **`src/app/layout.tsx`** — корневой лейаут, определяет HTML-структуру, метаданные и шрифты
- **`src/app/page.tsx`** — главная страница, стартовая точка для разработки
- **`src/app/globals.css`** — глобальные стили, CSS-переменные для светлой/тёмной темы
- **`next.config.ts`** — конфигурация Next.js (пока пустая, готова для кастомизации)
- **`tsconfig.json`** — строгий TypeScript с path alias `@/*`
